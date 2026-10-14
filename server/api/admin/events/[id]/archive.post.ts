import { archiveEvent } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await archiveEvent(parseId(event))
  return { ok: true }
})
