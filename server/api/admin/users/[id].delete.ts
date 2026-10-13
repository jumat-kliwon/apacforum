import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { users } from '~~/server/db/schema'

/** Hapus peserta: semua pendaftaran & e-tiket ikut terhapus; transaksi tetap (FK set null + snapshot). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(event)
  const [row] = await db.delete(users).where(and(eq(users.id, id), eq(users.role, 'participant'))).returning({ id: users.id })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Peserta tidak ditemukan' })
  return row
})
