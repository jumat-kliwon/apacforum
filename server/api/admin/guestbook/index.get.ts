import { guestbookListQuery } from '~~/shared/schemas/guestbook'
import { listGuestbook } from '~~/server/services/guestbook'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return listGuestbook(parseQuery(event, guestbookListQuery))
})
