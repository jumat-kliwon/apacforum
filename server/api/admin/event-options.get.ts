import { asc, desc } from 'drizzle-orm'
import { db } from '~~/server/db'
import { events, ticketTypes } from '~~/server/db/schema'

/** Event and ticket type options for filters. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const [evs, tts] = await Promise.all([
    db.select({ id: events.id, name: events.name, status: events.status }).from(events).orderBy(desc(events.startDate)),
    db.select({ name: ticketTypes.name }).from(ticketTypes).groupBy(ticketTypes.name).orderBy(asc(ticketTypes.name))
  ])
  return { events: evs, ticketTypeNames: tts.map(t => t.name) }
})
