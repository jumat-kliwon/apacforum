import { eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { roles } from '~~/server/db/schema'

/** The signed-in CMS user: what the CMS shows and which pages it opens. */
export default defineEventHandler(async (event) => {
  await requirePermission(event)
  const staff = (await getStaff(event))!
  const [role] = await db.select({ name: roles.name }).from(roles).where(eq(roles.key, staff.role))
  return { user: staff.user, role: { key: staff.role, name: role?.name ?? staff.role }, permissions: staff.permissions }
})
