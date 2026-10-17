import { deleteGuestbookEntry } from '~~/server/services/guestbook'

export default defineEventHandler(event => bulkDelete(event, deleteGuestbookEntry))
