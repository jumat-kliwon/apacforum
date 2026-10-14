import { eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { events } from '~~/server/db/schema'

/** Ticket scanner: the event a scanner link belongs to. */
export default defineEventHandler(async (event) => {
  const id = requireScannerKey(event, getQuery(event).key)
  const [ev] = await db.select({
    id: events.id, name: events.name, startDate: events.startDate, endDate: events.endDate, venueName: events.venueName, city: events.city
  }).from(events).where(eq(events.id, id))
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  return ev
})
