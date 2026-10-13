import { inArray } from 'drizzle-orm'
import { bulkParticipantSchema } from '~~/shared/schemas/participant'
import { db } from '~~/server/db'
import { participants } from '~~/server/db/schema'
import { resendStatusEmail, verifyParticipants } from '~~/server/services/registration'

/** Aksi massal di tabel peserta. `delete` menghapus pendaftaran (transaksi tetap tersimpan). */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const { action, ids } = await parseBody(event, bulkParticipantSchema)

  if (action === 'verify') {
    return { affected: await verifyParticipants(ids, { id: admin.id, name: admin.name }) }
  }
  if (action === 'email') {
    let sent = 0
    for (const id of ids) {
      await resendStatusEmail(id).then(() => sent++).catch(() => null)
    }
    return { affected: sent }
  }
  const rows = await db.delete(participants).where(inArray(participants.id, ids)).returning({ id: participants.id })
  return { affected: rows.length }
})
