import { asc, eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { events } from '~~/server/db/schema'
import { publicUrl } from '~~/server/services/storage'

export default defineEventHandler(async () => {
  const rows = await db.select({
    slug: events.slug, name: events.name, tagline: events.tagline, startDate: events.startDate, endDate: events.endDate,
    venueName: events.venueName, city: events.city, bannerKey: events.bannerKey, registrationOpen: events.registrationOpen,
    registrationDeadline: events.registrationDeadline
  }).from(events).where(eq(events.status, 'published')).orderBy(asc(events.startDate))
  return rows.map(({ bannerKey, ...r }) => ({ ...r, bannerUrl: publicUrl(bannerKey), isOpen: r.registrationOpen && r.registrationDeadline > new Date() }))
})
