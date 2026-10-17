import { asc, desc, eq } from 'drizzle-orm'
import * as z from 'zod'
import { db } from '~~/server/db'
import { events, ticketTypes } from '~~/server/db/schema'

const query = z.object({ eventId: z.uuid().optional() })

/** Every event (for the event switcher) and ticket type names (for filters; only one event's when `eventId` is given). */
export default defineEventHandler(async (event) => {
  await requirePermission(event)
  const { eventId } = parseQuery(event, query)
  const [evs, tts] = await Promise.all([
    db.select({
      id: events.id, code: events.code, name: events.name, status: events.status,
      startDate: events.startDate, endDate: events.endDate, city: events.city
    }).from(events).orderBy(desc(events.startDate)),
    db.select({ name: ticketTypes.name }).from(ticketTypes)
      .where(eventId ? eq(ticketTypes.eventId, eventId) : undefined)
      .groupBy(ticketTypes.name).orderBy(asc(ticketTypes.name))
  ])
  return { events: evs, ticketTypeNames: tts.map(t => t.name) }
})
