import { and, asc, eq, sql } from 'drizzle-orm'
import { db } from '~~/server/db'
import { agendaDays, events, partners, participants, speakers, ticketTypes, transactions } from '~~/server/db/schema'
import { deleteImpact } from '~~/server/services/events'
import { publicUrl } from '~~/server/services/storage'

/** Full event: used by the detail page and the edit form. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const id = parseId(event)
  const [ev] = await db.select().from(events).where(eq(events.id, id))
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  const [days, sp, pa, tickets, sold, [stats], [revenue], impact] = await Promise.all([
    db.select().from(agendaDays).where(eq(agendaDays.eventId, id)).orderBy(asc(agendaDays.sortOrder)),
    db.select().from(speakers).where(eq(speakers.eventId, id)).orderBy(asc(speakers.sortOrder)),
    db.select().from(partners).where(eq(partners.eventId, id)).orderBy(asc(partners.sortOrder)),
    db.select().from(ticketTypes).where(eq(ticketTypes.eventId, id)).orderBy(asc(ticketTypes.sortOrder)),
    db.select({ ticketTypeId: participants.ticketTypeId, n: sql<number>`count(*)::int` }).from(participants)
      .where(and(eq(participants.eventId, id), eq(participants.paymentStatus, 'paid'))).groupBy(participants.ticketTypeId),
    db.select({ n: sql<number>`count(*) filter (where ${participants.status} not in ('rejected', 'cancelled'))::int` }).from(participants).where(eq(participants.eventId, id)),
    db.select({ sum: sql<string>`coalesce(sum(${transactions.total}), 0)::bigint` }).from(transactions).where(and(eq(transactions.eventId, id), eq(transactions.status, 'paid'))),
    deleteImpact([id])
  ])

  return {
    event: {
      ...ev,
      // the form uses a date; registration closes at 23:59 WIB
      registrationDeadlineDate: new Date(ev.registrationDeadline.getTime() + 7 * 3600_000).toISOString().slice(0, 10),
      bannerUrl: publicUrl(ev.bannerKey),
      /** Paid ticket prices are converted when the currency changes; the form warns about it. */
      hasPaidTickets: tickets.some(t => t.price > 0),
      scannerPath: scannerPath(ev.id)
    },
    agendaDays: days,
    speakers: sp.map(s => ({ ...s, photoUrl: publicUrl(s.photoKey) })),
    partners: pa.map(p => ({ ...p, logoUrl: publicUrl(p.logoKey) })),
    ticketTypes: tickets.map(t => ({ ...t, sold: sold.find(s => s.ticketTypeId === t.id)?.n ?? 0 })),
    stats: { participants: stats?.n ?? 0, revenue: Number(revenue?.sum ?? 0) },
    impact: impact.get(id)!
  }
})
