import { deleteEvent } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  await deleteEvent(parseId(event))
  return { ok: true }
})
