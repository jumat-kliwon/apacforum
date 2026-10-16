import { guestbookEntrySchema } from '~~/shared/schemas/guestbook'
import { createGuestbookEntry } from '~~/server/services/guestbook'

export default defineEventHandler(async (event) => {
  rateLimit(event, 'guestbook', { limit: 5, windowMs: 10 * 60_000 })
  const slug = getRouterParam(event, 'slug') ?? ''
  const body = await parseBody(event, guestbookEntrySchema)
  await createGuestbookEntry(slug, body)
  return { ok: true }
})
