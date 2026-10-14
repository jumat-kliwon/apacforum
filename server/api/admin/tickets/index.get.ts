import { ticketTypeListQuery } from '~~/shared/schemas/event'
import { listTicketTypes } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return listTicketTypes(parseQuery(event, ticketTypeListQuery))
})
