import { deleteSpeaker } from '~~/server/services/speakers'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  await deleteSpeaker(parseId(event))
  return { ok: true }
})
