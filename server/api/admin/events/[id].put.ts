import { eventFormSchema } from '~~/shared/schemas/event'
import { saveEvent } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  const admin = await requireStaff(event)
  const id = parseId(event)
  const form = await parseBody(event, eventFormSchema)
  return { id: await saveEvent(form, admin, id) }
})
