import { deleteEvent } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  await deleteEvent(parseId(event))
  return { ok: true }
})
