import { and, asc, eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { agendaDays, events, speakers } from '~~/server/db/schema'
import { publicUrl } from '~~/server/services/storage'

/** Published speakers of the published default event (/apcr-2026). */
export default defineEventHandler(async () => {
  const rows = await db.select({
    id: speakers.id,
    name: speakers.name,
    title: speakers.title,
    category: speakers.category,
    photoKey: speakers.photoKey,
    dayLabel: agendaDays.label
  })
    .from(speakers)
    .innerJoin(events, eq(events.id, speakers.eventId))
    .leftJoin(agendaDays, eq(agendaDays.id, speakers.agendaDayId))
    .where(and(eq(events.isDefault, true), eq(events.status, 'published'), eq(speakers.status, 'published')))
    .orderBy(asc(speakers.sortOrder), asc(speakers.name))
  return rows.map(({ photoKey, ...s }) => ({ ...s, photoUrl: publicUrl(photoKey) }))
})
