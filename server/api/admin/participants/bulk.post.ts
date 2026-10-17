import { inArray } from 'drizzle-orm'
import { bulkParticipantSchema } from '~~/shared/schemas/participant'
import { db } from '~~/server/db'
import { participants } from '~~/server/db/schema'
import { resendStatusEmail, verifyParticipants } from '~~/server/services/registration'

/** Bulk actions in the participant table. `delete` removes registrations (transactions are kept). */
export default defineEventHandler(async (event) => {
  const admin = await requireStaff(event)
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
