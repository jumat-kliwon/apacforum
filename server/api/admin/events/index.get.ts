import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm'
import * as z from 'zod'
import { db } from '~~/server/db'
import { events, participants } from '~~/server/db/schema'
import { deleteImpact } from '~~/server/services/events'

const query = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  sort: z.enum(['name', 'date', 'place', 'count', 'status']).default('date'),
  dir: z.enum(['asc', 'desc']).default('asc')
})

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const q = parseQuery(event, query)
  const count = sql<number>`count(${participants.id}) filter (where ${participants.status} not in ('rejected', 'cancelled'))::int`
  const sortCol = { name: events.name, date: events.startDate, place: events.city, count, status: events.status }[q.sort]
  const rows = await db.select({
    id: events.id, name: events.name, slug: events.slug, tagline: events.tagline, startDate: events.startDate, endDate: events.endDate,
    venueName: events.venueName, city: events.city, capacity: events.capacity, status: events.status, participantCount: count
  }).from(events)
    .leftJoin(participants, eq(participants.eventId, events.id))
    .where(and(q.q ? ilike(events.name, likePattern(q.q)) : undefined, q.status ? eq(events.status, q.status) : undefined))
    .groupBy(events.id)
    .orderBy(q.dir === 'asc' ? asc(sortCol) : desc(sortCol))
  const impact = await deleteImpact(rows.map(r => r.id))
  return rows.map(r => ({ ...r, impact: impact.get(r.id)! }))
})
