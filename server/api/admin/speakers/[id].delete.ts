import { deleteSpeaker } from '~~/server/services/speakers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await deleteSpeaker(parseId(event))
  return { ok: true }
})
