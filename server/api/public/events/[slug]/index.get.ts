import { and, asc, eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { agendaDays, events, partners, speakers, ticketTypes } from '~~/server/db/schema'
import { activeCount } from '~~/server/services/payment'
import { publicUrl } from '~~/server/services/storage'

/** Public event page: published events, published speakers and tickets on sale only. */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const [ev] = await db.select().from(events).where(and(eq(events.slug, slug), eq(events.status, 'published')))
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  const [days, sp, pa, tickets] = await Promise.all([
    db.select().from(agendaDays).where(eq(agendaDays.eventId, ev.id)).orderBy(asc(agendaDays.sortOrder)),
    db.select().from(speakers).where(and(eq(speakers.eventId, ev.id), eq(speakers.status, 'published'))).orderBy(asc(speakers.sortOrder)),
    db.select().from(partners).where(eq(partners.eventId, ev.id)).orderBy(asc(partners.sortOrder)),
    db.select().from(ticketTypes).where(and(eq(ticketTypes.eventId, ev.id), eq(ticketTypes.isOnSale, true))).orderBy(asc(ticketTypes.sortOrder))
  ])
  const remaining = await Promise.all(tickets.map(async t => Math.max(0, t.quota - await activeCount(db, t.id))))

  return {
    event: {
      slug: ev.slug, name: ev.name, tagline: ev.tagline, description: ev.description, startDate: ev.startDate, endDate: ev.endDate,
      venueName: ev.venueName, venueAddress: ev.venueAddress, city: ev.city, bannerUrl: publicUrl(ev.bannerKey),
      registrationDeadline: ev.registrationDeadline,
      isOpen: ev.registrationOpen && ev.registrationDeadline > new Date()
    },
    agendaDays: days.map(d => ({ id: d.id, label: d.label, date: d.date, theme: d.theme, body: d.body })),
    speakers: sp.map(s => ({ id: s.id, name: s.name, title: s.title, category: s.category, photoUrl: publicUrl(s.photoKey), dayLabel: days.find(d => d.id === s.agendaDayId)?.label ?? null })),
    partners: pa.map(p => ({ id: p.id, name: p.name, category: p.category, websiteUrl: p.websiteUrl, logoUrl: publicUrl(p.logoKey) })),
    ticketTypes: tickets.map((t, i) => ({ id: t.id, name: t.name, price: t.price, paxPerTicket: t.paxPerTicket, remaining: remaining[i]! }))
  }
})
