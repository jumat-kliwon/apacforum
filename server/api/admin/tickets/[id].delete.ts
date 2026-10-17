import { deleteTicketType } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  await deleteTicketType(parseId(event))
  return { ok: true }
})
