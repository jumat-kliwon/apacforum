import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm'
import type { z } from 'zod'
import type { GuestbookEntry, guestbookListQuery } from '../../shared/schemas/guestbook'
import { db } from '../db'
import { events, guestbookEntries } from '../db/schema'
import { likePattern } from '../utils/validate'

// ── guestbook (the /contact form) ──

/** Files an entry under a published event, found by its slug. */
export async function createGuestbookEntry(slug: string, entry: GuestbookEntry) {
  const [ev] = await db.select({ id: events.id }).from(events)
    .where(and(eq(events.slug, slug), eq(events.status, 'published')))
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  const [row] = await db.insert(guestbookEntries).values({ ...entry, eventId: ev.id }).returning({ id: guestbookEntries.id })
  return row!.id
}

export async function deleteGuestbookEntry(id: string) {
  const [row] = await db.delete(guestbookEntries).where(eq(guestbookEntries.id, id)).returning({ id: guestbookEntries.id })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
}

const guestbookSelect = {
  id: guestbookEntries.id,
  name: guestbookEntries.name,
  email: guestbookEntries.email,
  institution: guestbookEntries.institution,
  position: guestbookEntries.position,
  country: guestbookEntries.country,
  topic: guestbookEntries.topic,
  message: guestbookEntries.message,
  createdAt: guestbookEntries.createdAt
}

function guestbookWhere(q: z.output<typeof guestbookListQuery>) {
  const like = q.q ? likePattern(q.q) : undefined
  return and(
    eq(guestbookEntries.eventId, q.eventId),
    like
      ? or(ilike(guestbookEntries.name, like), ilike(guestbookEntries.email, like), ilike(guestbookEntries.institution, like))
      : undefined,
    q.topic ? eq(guestbookEntries.topic, q.topic) : undefined
  )
}

function guestbookOrder(q: z.output<typeof guestbookListQuery>) {
  const sortCol = { date: guestbookEntries.createdAt, name: guestbookEntries.name, country: guestbookEntries.country }[q.sort]
  return [q.dir === 'asc' ? asc(sortCol) : desc(sortCol), desc(guestbookEntries.createdAt)]
}

export async function listGuestbook(q: z.output<typeof guestbookListQuery>) {
  const where = guestbookWhere(q)
  const [rows, [count], topics] = await Promise.all([
    db.select(guestbookSelect).from(guestbookEntries)
      .where(where)
      .orderBy(...guestbookOrder(q))
      .limit(q.pageSize).offset((q.page - 1) * q.pageSize),
    db.select({ total: sql<number>`count(*)::int` }).from(guestbookEntries).where(where),
    // the topic filter offers what visitors actually picked for this event
    db.selectDistinct({ topic: guestbookEntries.topic }).from(guestbookEntries)
      .where(and(eq(guestbookEntries.eventId, q.eventId), sql`${guestbookEntries.topic} is not null`))
      .orderBy(asc(guestbookEntries.topic))
  ])
  return {
    rows,
    total: count?.total ?? 0,
    topics: topics.map(t => t.topic!)
  }
}

export function exportGuestbook(q: z.output<typeof guestbookListQuery>) {
  return db.select(guestbookSelect).from(guestbookEntries)
    .where(guestbookWhere(q))
    .orderBy(...guestbookOrder(q))
}
