import { deleteTicketType } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await deleteTicketType(parseId(event))
  return { ok: true }
})
