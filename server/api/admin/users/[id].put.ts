import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { profileSchema } from '~~/shared/schemas/participant'
import { db } from '~~/server/db'
import { users } from '~~/server/db/schema'

const schema = profileSchema.extend({ email: z.email('Email tidak valid').trim().toLowerCase() })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(event)
  const body = await parseBody(event, schema)
  try {
    const [row] = await db.update(users).set(body).where(and(eq(users.id, id), eq(users.role, 'participant'))).returning({ id: users.id })
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Peserta tidak ditemukan' })
    return row
  } catch (err) {
    if (pgError(err).code === '23505') throw createError({ statusCode: 409, statusMessage: 'Email sudah dipakai user lain' })
    throw err
  }
})
