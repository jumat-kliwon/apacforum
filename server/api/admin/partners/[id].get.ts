import { eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { events, partners } from '~~/server/db/schema'
import { partnerSelect, withLogoUrl } from '~~/server/services/partners'

/** One partner — the edit form. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const id = parseId(event)
  const [row] = await db.select(partnerSelect).from(partners)
    .innerJoin(events, eq(events.id, partners.eventId))
    .where(eq(partners.id, id))
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Partner not found' })
  return withLogoUrl(row)
})
