/**
 * Runs on every deploy. Syncs the `permissions` table with shared/utils/access.ts (removed permissions
 * drop out of every role), then creates the first superadmin account if it does not exist yet:
 * an existing user with that email is left untouched (its password is never reset here).
 *
 *   ADMIN_EMAIL=… ADMIN_PASSWORD=… [ADMIN_NAME=…] bun run db:bootstrap
 */
import { eq, notInArray, sql } from 'drizzle-orm'
import { PERMISSION_KEYS, PERMISSIONS } from '../../shared/utils/access'
import { auth } from '../utils/auth'
import { client, db } from './index'
import { accounts, permissions, users } from './schema'

await db.transaction(async (tx) => {
  await tx.insert(permissions)
    .values(PERMISSION_KEYS.map(key => ({ key, ...PERMISSIONS[key] })))
    .onConflictDoUpdate({
      target: permissions.key,
      set: { group: sql`excluded.group`, label: sql`excluded.label`, description: sql`excluded.description` }
    })
  await tx.delete(permissions).where(notInArray(permissions.key, PERMISSION_KEYS))
})
console.log(`Permissions synced (${PERMISSION_KEYS.length})`)

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME?.trim() || 'APCR Admin'

if (!email || !password) {
  console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin bootstrap')
} else {
  const [existing] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.email, email))
  if (existing) {
    console.log(`Admin bootstrap: ${email} already exists (role ${existing.role}) — nothing to do`)
  } else {
    if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters')
    const ctx = await auth.$context
    await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values({ name, email, emailVerified: true, role: 'superadmin' }).returning({ id: users.id })
      await tx.insert(accounts).values({
        accountId: user!.id,
        providerId: 'credential',
        userId: user!.id,
        password: await ctx.password.hash(password)
      })
    })
    console.log(`Admin bootstrap: created ${email}`)
  }
}
await client.close()
