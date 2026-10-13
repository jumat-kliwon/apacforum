import { and, eq } from 'drizzle-orm'
import * as z from 'zod'
import { profileSchema } from '~~/shared/schemas/participant'
import { db } from '~~/server/db'
import { users } from '~~/server/db/schema'

const schema = profileSchema.extend({ email: z.email('Enter a valid email').trim().toLowerCase() })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(event)
  const body = await parseBody(event, schema)
  try {
    const [row] = await db.update(users).set(body).where(and(eq(users.id, id), eq(users.role, 'participant'))).returning({ id: users.id })
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Participant not found' })
    return row
  } catch (err) {
    if (pgError(err).code === '23505') throw createError({ statusCode: 409, statusMessage: 'Another user already has this email' })
    throw err
  }
})
