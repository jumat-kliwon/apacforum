import { deleteGuestbookEntry } from '~~/server/services/guestbook'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await deleteGuestbookEntry(parseId(event))
  return { ok: true }
})
