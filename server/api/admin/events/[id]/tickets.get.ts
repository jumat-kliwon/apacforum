import { asc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/db'
import { events, participants, ticketTypes } from '~~/server/db/schema'

/** Ticket types of one event with paid counts — the Tickets page. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(event)
  const [ev] = await db.select({ id: events.id, name: events.name, status: events.status, capacity: events.capacity })
    .from(events).where(eq(events.id, id))
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  const [tickets, counts] = await Promise.all([
    db.select().from(ticketTypes).where(eq(ticketTypes.eventId, id)).orderBy(asc(ticketTypes.sortOrder)),
    db.select({
      ticketTypeId: participants.ticketTypeId,
      sold: sql<number>`count(*) filter (where ${participants.paymentStatus} = 'paid')::int`,
      registered: sql<number>`count(*) filter (where ${participants.status} not in ('rejected', 'cancelled'))::int`,
      // any registration (even rejected) blocks deleting the ticket type: participants → ticket_types is RESTRICT
      used: sql<number>`count(*)::int`
    }).from(participants).where(eq(participants.eventId, id)).groupBy(participants.ticketTypeId)
  ])

  return {
    event: ev,
    ticketTypes: tickets.map((t) => {
      const c = counts.find(x => x.ticketTypeId === t.id)
      return { ...t, sold: c?.sold ?? 0, registered: c?.registered ?? 0, used: c?.used ?? 0 }
    })
  }
})
