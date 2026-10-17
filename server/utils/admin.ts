import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { rolePermissions, roles } from '../db/schema'
import { auth } from './auth'

export type Staff = {
  user: { id: string, name: string, email: string }
  role: string
  permissions: Permission[]
}

/** Permissions of a role. Read on every request, so a role change applies at once. */
export async function permissionsOf(role: string): Promise<Permission[]> {
  if (role === SUPERADMIN_ROLE) return [...PERMISSION_KEYS]
  const rows = await db.select({ key: rolePermissions.permissionKey })
    .from(rolePermissions)
    .innerJoin(roles, eq(roles.id, rolePermissions.roleId))
    .where(eq(roles.key, role))
  return rows.map(r => r.key).filter(isPermission)
}

type Lookup = { signedIn: boolean, staff: Staff | null }

async function lookup(event: H3Event): Promise<Lookup> {
  if (event.context.staffLookup) return event.context.staffLookup
  const session = await auth.api.getSession({ headers: event.headers })
  let staff: Staff | null = null
  const role = session?.user.role ?? PARTICIPANT_ROLE
  if (session && role !== PARTICIPANT_ROLE) {
    const permissions = await permissionsOf(role)
    if (permissions.length) {
      staff = { user: { id: session.user.id, name: session.user.name, email: session.user.email }, role, permissions }
    }
  }
  event.context.staffLookup = { signedIn: !!session, staff }
  return event.context.staffLookup
}

/** The signed-in CMS user with its role and permissions, or null. A role without permissions has no CMS access. */
export async function getStaff(event: H3Event) {
  return (await lookup(event)).staff
}

/**
 * Requires a CMS session holding at least one of `needed`; every `/api/admin/**` route calls this.
 * Without arguments any CMS user passes (e.g. the event list behind the event switcher).
 */
export async function requirePermission(event: H3Event, ...needed: Permission[]) {
  const { signedIn, staff } = await lookup(event)
  if (!signedIn) {
    throw createError({ statusCode: 401, statusMessage: 'Please sign in first' })
  }
  if (!staff || (needed.length && !can(staff.permissions, needed))) {
    throw createError({ statusCode: 403, statusMessage: 'You do not have access to this' })
  }
  return staff.user
}

declare module 'h3' {
  interface H3EventContext {
    staffLookup?: Lookup
  }
}
