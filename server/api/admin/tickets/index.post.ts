import { ticketTypeFormSchema } from '~~/shared/schemas/event'
import { createTicketType } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const form = await parseBody(event, ticketTypeFormSchema)
  return { id: await createTicketType(form) }
})
