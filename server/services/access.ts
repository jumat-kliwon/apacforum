import { and, asc, count, desc, eq, ilike, ne, or, sql } from 'drizzle-orm'
import type { z } from 'zod'
import { roleKey, type RoleForm, type StaffCreate, type staffListQuery, type StaffUpdate } from '../../shared/schemas/access'
import { db } from '../db'
import { accounts, rolePermissions, roles, sessions, users } from '../db/schema'
import { auth } from '../utils/auth'
import { pgError } from '../utils/db-error'
import { likePattern } from '../utils/validate'
import { canGrant, isPermission, PARTICIPANT_ROLE, PERMISSION_KEYS, SUPERADMIN_ROLE } from '../../shared/utils/access'
import { permissionsOf, type Staff } from '../utils/admin'

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

const forbidden = (statusMessage: string) => createError({ statusCode: 403, statusMessage })

/** Staff roles with their permissions and how many users hold them. Superadmin first, then by name. */
export async function listRoles() {
  const rows = await db.select({
    id: roles.id,
    key: roles.key,
    name: roles.name,
    description: roles.description,
    isSystem: roles.isSystem,
    permissions: sql<string[]>`coalesce((select array_agg(${rolePermissions.permissionKey} order by ${rolePermissions.permissionKey}) from ${rolePermissions} where ${rolePermissions.roleId} = ${roles.id}), '{}')`,
    users: sql<number>`(select count(*)::int from ${users} where ${users.role} = ${roles.key})`
  }).from(roles)
    .where(ne(roles.key, PARTICIPANT_ROLE))
    .orderBy(desc(roles.isSystem), asc(roles.name))
  return rows.map(r => ({ ...r, permissions: r.key === SUPERADMIN_ROLE ? [...PERMISSION_KEYS] : r.permissions.filter(isPermission) }))
}

async function editableRole(tx: Tx, actor: Staff, id: string) {
  const [role] = await tx.select().from(roles).where(eq(roles.id, id)).for('update')
  if (!role || role.key === PARTICIPANT_ROLE) throw createError({ statusCode: 404, statusMessage: 'Role not found' })
  if (role.isSystem) throw forbidden('System roles cannot be changed')
  // editing the role you hold could lock you out
  if (role.key === actor.role) throw forbidden('You cannot change your own role')
  if (!canGrant(actor, role.key, await permissionsOf(role.key))) throw forbidden('This role has permissions you do not have')
  return role
}

export async function createRole(actor: Staff, form: RoleForm) {
  const key = roleKey(form.name)
  if (!key) throw createError({ statusCode: 422, statusMessage: 'Use letters or digits in the role name' })
  if (!canGrant(actor, key, form.permissions)) throw forbidden('You can only grant permissions you have yourself')
  try {
    return await db.transaction(async (tx) => {
      const [role] = await tx.insert(roles).values({ key, name: form.name, description: form.description }).returning({ id: roles.id })
      if (form.permissions.length) {
        await tx.insert(rolePermissions).values(form.permissions.map(permissionKey => ({ roleId: role!.id, permissionKey })))
      }
      return role!.id
    })
  } catch (err) {
    if (pgError(err).code === '23505') throw createError({ statusCode: 409, statusMessage: 'A role with this name already exists' })
    throw err
  }
}

export async function updateRole(actor: Staff, id: string, form: RoleForm) {
  if (!canGrant(actor, '', form.permissions)) throw forbidden('You can only grant permissions you have yourself')
  await db.transaction(async (tx) => {
    await editableRole(tx, actor, id)
    // the key stays: it is stored on every user with this role
    await tx.update(roles).set({ name: form.name, description: form.description }).where(eq(roles.id, id))
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, id))
    if (form.permissions.length) {
      await tx.insert(rolePermissions).values(form.permissions.map(permissionKey => ({ roleId: id, permissionKey })))
    }
  })
}

export async function deleteRole(actor: Staff, id: string) {
  await db.transaction(async (tx) => {
    const role = await editableRole(tx, actor, id)
    const [inUse] = await tx.select({ n: count() }).from(users).where(eq(users.role, role.key))
    if (inUse!.n) throw createError({ statusCode: 409, statusMessage: `${inUse!.n} user(s) still have this role. Give them another role first.` })
    await tx.delete(roles).where(eq(roles.id, id))
  })
}

/** CMS accounts: everyone who is not a participant. */
export async function listStaff(q: z.output<typeof staffListQuery>) {
  const where = and(
    ne(users.role, PARTICIPANT_ROLE),
    q.q ? or(ilike(users.name, likePattern(q.q)), ilike(sql`${users.email}::text`, likePattern(q.q))) : undefined,
    q.role ? eq(users.role, q.role) : undefined
  )
  const [rows, [total]] = await Promise.all([
    db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      roleName: roles.name,
      active: sql<boolean>`not coalesce(${users.banned}, false)`,
      lastSeenAt: sql<string | null>`(select max(${sessions.updatedAt}) from ${sessions} where ${sessions.userId} = ${users.id})`,
      createdAt: users.createdAt
    }).from(users)
      .innerJoin(roles, eq(roles.key, users.role))
      .where(where)
      .orderBy(asc(users.name), asc(users.id))
      .limit(q.pageSize)
      .offset((q.page - 1) * q.pageSize),
    db.select({ n: count() }).from(users).where(where)
  ])
  return { rows, total: total?.n ?? 0 }
}

/** Checks that `actor` may hand out `key` and returns it. */
async function assignableRole(actor: Staff, key: string) {
  const [role] = await db.select({ key: roles.key }).from(roles).where(eq(roles.key, key))
  if (!role || role.key === PARTICIPANT_ROLE) throw createError({ statusCode: 422, statusMessage: 'Choose a valid role' })
  if (!canGrant(actor, role.key, await permissionsOf(role.key))) throw forbidden('You cannot assign a role with permissions you do not have')
  return role.key
}

async function setPassword(tx: Tx, userId: string, password: string) {
  const hash = await (await auth.$context).password.hash(password)
  const [updated] = await tx.update(accounts).set({ password: hash })
    .where(and(eq(accounts.userId, userId), eq(accounts.providerId, 'credential')))
    .returning({ id: accounts.id })
  if (!updated) await tx.insert(accounts).values({ accountId: userId, providerId: 'credential', userId, password: hash })
}

export async function createStaff(actor: Staff, input: StaffCreate) {
  const role = await assignableRole(actor, input.role)
  const [existing] = await db.select({ role: users.role }).from(users).where(eq(users.email, input.email))
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: existing.role === PARTICIPANT_ROLE ? 'This email belongs to a participant' : 'This email already has an account' })
  }
  return db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values({ name: input.name, email: input.email, emailVerified: true, role }).returning({ id: users.id })
    await setPassword(tx, user!.id, input.password)
    return user!.id
  })
}

export async function updateStaff(actor: Staff, id: string, input: StaffUpdate) {
  const [target] = await db.select({ id: users.id, role: users.role, banned: users.banned }).from(users).where(eq(users.id, id))
  if (!target || target.role === PARTICIPANT_ROLE) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  const self = target.id === actor.user.id
  const roleChange = input.role !== undefined && input.role !== target.role
  if (self && (roleChange || input.active === false)) throw forbidden('You cannot change your own role or deactivate yourself')
  // only someone who could have given the target its role may manage it (keeps superadmins safe from admins)
  if (!self && !canGrant(actor, target.role, await permissionsOf(target.role))) throw forbidden('This user has permissions you do not have')
  const role = roleChange ? await assignableRole(actor, input.role!) : target.role

  await db.transaction(async (tx) => {
    const losesSuperadmin = target.role === SUPERADMIN_ROLE && (role !== SUPERADMIN_ROLE || (input.active === false && !target.banned))
    if (losesSuperadmin) {
      const others = await tx.select({ id: users.id }).from(users)
        .where(and(eq(users.role, SUPERADMIN_ROLE), ne(users.id, target.id), sql`not coalesce(${users.banned}, false)`))
        .for('update')
      if (!others.length) throw createError({ statusCode: 409, statusMessage: 'Keep at least one active superadmin' })
    }
    await tx.update(users).set({
      ...(input.name !== undefined && { name: input.name }),
      role,
      ...(input.active !== undefined && { banned: !input.active, banReason: input.active ? null : 'Deactivated in the CMS', banExpires: null })
    }).where(eq(users.id, target.id))
    if (input.password) await setPassword(tx, target.id, input.password)
    // a deactivated account or a reset password ends every open session (except your own when you change yours)
    if (input.active === false || (input.password && !self)) {
      await tx.delete(sessions).where(eq(sessions.userId, target.id))
    }
  })
}
