import { ticketsFormSchema } from '~~/shared/schemas/event'
import { saveTicketTypes } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(event)
  const form = await parseBody(event, ticketsFormSchema)
  await saveTicketTypes(id, form)
  return { id }
})
