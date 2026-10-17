import { ticketTypeListQuery } from '~~/shared/schemas/event'
import { listTicketTypes } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  return listTicketTypes(parseQuery(event, ticketTypeListQuery))
})
