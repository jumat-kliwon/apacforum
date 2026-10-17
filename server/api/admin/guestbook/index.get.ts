import { guestbookListQuery } from '~~/shared/schemas/guestbook'
import { listGuestbook } from '~~/server/services/guestbook'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'guestbook.manage')
  return listGuestbook(parseQuery(event, guestbookListQuery))
})
