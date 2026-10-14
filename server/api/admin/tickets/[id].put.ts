import { ticketTypeFormSchema } from '~~/shared/schemas/event'
import { updateTicketType } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(event)
  const form = await parseBody(event, ticketTypeFormSchema)
  return { id: await updateTicketType(id, form) }
})
