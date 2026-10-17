import { deleteGuestbookEntry } from '~~/server/services/guestbook'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'guestbook.manage')
  await deleteGuestbookEntry(parseId(event))
  return { ok: true }
})
