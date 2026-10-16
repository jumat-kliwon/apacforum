import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm'
import type { z } from 'zod'
import type { SpeakerForm, speakerListQuery } from '../../shared/schemas/event'
import { db } from '../db'
import { agendaDays, events, speakers } from '../db/schema'
import type { Db } from './context'
import { assertUploads, deleteObjects, publicUrl } from './storage'
import { likePattern } from '../utils/validate'

// ── speakers (the Speakers page) ──

const speakerValues = (f: SpeakerForm) => ({
  name: f.name, title: f.title, category: f.category, status: f.status,
  photoKey: f.photoKey ?? null, agendaDayId: f.agendaDayId
})

/** A session must be one of the event's own agenda days. */
async function assertAgendaDay(tx: Db, eventId: string, agendaDayId: string | null) {
  if (!agendaDayId) return
  const [day] = await tx.select({ id: agendaDays.id }).from(agendaDays)
    .where(and(eq(agendaDays.id, agendaDayId), eq(agendaDays.eventId, eventId)))
  if (!day) throw createError({ statusCode: 422, statusMessage: 'This agenda day does not belong to the event' })
}

export async function createSpeaker(form: SpeakerForm) {
  await assertUploads([form.photoKey])
  return db.transaction(async (tx) => {
    const [ev] = await tx.select({ id: events.id }).from(events).where(eq(events.id, form.eventId)).for('update')
    if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    await assertAgendaDay(tx, form.eventId, form.agendaDayId)
    const [last] = await tx.select({ n: sql<number>`coalesce(max(${speakers.sortOrder}), 0)::int` }).from(speakers).where(eq(speakers.eventId, form.eventId))
    const [row] = await tx.insert(speakers).values({ ...speakerValues(form), eventId: form.eventId, sortOrder: (last?.n ?? 0) + 1 }).returning({ id: speakers.id })
    return row!.id
  })
}

export async function updateSpeaker(id: string, form: SpeakerForm) {
  const [prev] = await db.select({ photoKey: speakers.photoKey }).from(speakers)
    .where(and(eq(speakers.id, id), eq(speakers.eventId, form.eventId)))
  if (!prev) throw createError({ statusCode: 404, statusMessage: 'Speaker not found' })
  await assertAgendaDay(db, form.eventId, form.agendaDayId)
  // only a newly uploaded photo needs checking
  if (form.photoKey && form.photoKey !== prev.photoKey) await assertUploads([form.photoKey])
  await db.update(speakers).set(speakerValues(form)).where(eq(speakers.id, id))
  if (prev.photoKey && prev.photoKey !== (form.photoKey ?? null)) await deleteObjects([prev.photoKey])
  return id
}

export async function deleteSpeaker(id: string) {
  const [row] = await db.delete(speakers).where(eq(speakers.id, id)).returning({ photoKey: speakers.photoKey })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Speaker not found' })
  await deleteObjects([row.photoKey])
}

export const speakerSelect = {
  id: speakers.id,
  eventId: speakers.eventId,
  eventName: events.name,
  name: speakers.name,
  title: speakers.title,
  category: speakers.category,
  agendaDayId: speakers.agendaDayId,
  dayNumber: agendaDays.sortOrder,
  dayLabel: agendaDays.label,
  photoKey: speakers.photoKey,
  status: speakers.status,
  sortOrder: speakers.sortOrder,
  updatedAt: speakers.updatedAt
}

export const withPhotoUrl = <T extends { photoKey: string | null }>(s: T) => ({ ...s, photoUrl: publicUrl(s.photoKey) })

export async function listSpeakers(q: z.output<typeof speakerListQuery>) {
  const where = and(
    q.q ? or(ilike(speakers.name, likePattern(q.q)), ilike(speakers.title, likePattern(q.q))) : undefined,
    q.eventId ? eq(speakers.eventId, q.eventId) : undefined,
    q.category ? eq(speakers.category, q.category) : undefined,
    q.status ? eq(speakers.status, q.status) : undefined
  )
  const sortCol = { order: speakers.sortOrder, name: speakers.name, category: speakers.category, session: agendaDays.sortOrder, status: speakers.status }[q.sort]
  const order = q.dir === 'asc' ? asc(sortCol) : desc(sortCol)
  const [rows, [count]] = await Promise.all([
    db.select(speakerSelect).from(speakers)
      .innerJoin(events, eq(events.id, speakers.eventId))
      .leftJoin(agendaDays, eq(agendaDays.id, speakers.agendaDayId))
      .where(where)
      .orderBy(order, asc(speakers.sortOrder))
      .limit(q.pageSize).offset((q.page - 1) * q.pageSize),
    db.select({ total: sql<number>`count(*)::int` }).from(speakers).where(where)
  ])
  return {
    rows: rows.map(withPhotoUrl),
    total: count?.total ?? 0
  }
}
