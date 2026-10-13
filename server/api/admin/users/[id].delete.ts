import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { users } from '~~/server/db/schema'

/** Deletes a participant: all registrations and e-tickets go too; transactions stay (FK set null + snapshot). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(event)
  const [row] = await db.delete(users).where(and(eq(users.id, id), eq(users.role, 'participant'))).returning({ id: users.id })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Participant not found' })
  return row
})
