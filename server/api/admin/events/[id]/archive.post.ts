import { archiveEvent } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  await archiveEvent(parseId(event))
  return { ok: true }
})
