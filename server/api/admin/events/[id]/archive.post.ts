import { archiveEvent } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  await archiveEvent(parseId(event))
  return { ok: true }
})
