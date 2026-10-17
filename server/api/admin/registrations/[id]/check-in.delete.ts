import { undoCheckIn } from '~~/server/services/checkin'

/** Clears a check-in so the ticket can be scanned again. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'registrations.manage')
  await undoCheckIn(parseId(event))
  return { ok: true }
})
