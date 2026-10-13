import { and, eq, inArray, notInArray, sql } from 'drizzle-orm'
import type { EventForm } from '../../shared/schemas/event'
import { db } from '../db'
import { agendaDays, events, partners, participants, speakers, ticketTypes, transactions } from '../db/schema'
import { deadlineFromDate } from './registration'
import { assertUploads, deleteObjects } from './storage'
import type { Tx } from './context'
import { pgError } from '../utils/db-error'
import { sanitizeDescription } from '../utils/sanitizeDescription'

type Actor = { id: string }

/** Transaction states that hold money or may still receive it. An event with any of these is archived, not deleted. */
const MONEY_STATUSES: ('pending' | 'paid' | 'refunded')[] = ['pending', 'paid', 'refunded']

/** Syncs child rows: delete removed ones, update existing ones, insert new ones. */
async function syncChildren<T extends { id?: string }>(
  tx: Tx,
  table: typeof agendaDays | typeof speakers | typeof partners | typeof ticketTypes,
  eventId: string,
  items: T[],
  toRow: (item: T, index: number) => Record<string, unknown>
) {
  const keep = items.map(i => i.id).filter((id): id is string => !!id)
  const removed = await tx.delete(table)
    .where(and(eq(table.eventId, eventId), keep.length ? notInArray(table.id, keep) : sql`true`))
    .returning()
  const ids: string[] = []
  for (const [i, item] of items.entries()) {
    const row = { ...toRow(item, i), eventId }
    if (item.id) {
      const [u] = await tx.update(table).set(row).where(and(eq(table.id, item.id), eq(table.eventId, eventId))).returning({ id: table.id })
      if (!u) throw createError({ statusCode: 422, statusMessage: 'A nested item does not belong to this event' })
      ids.push(u.id)
    } else {
      const [n] = await tx.insert(table).values(row as never).returning({ id: table.id })
      ids.push(n!.id)
    }
  }
  return { ids, removed }
}

export async function saveEvent(form: EventForm, actor: Actor, eventId?: string) {
  const values = {
    name: form.name,
    code: form.code,
    slug: form.slug,
    tagline: form.tagline,
    description: sanitizeDescription(form.description),
    startDate: form.startDate,
    endDate: form.endDate,
    registrationDeadline: deadlineFromDate(form.registrationDeadline),
    venueName: form.venueName,
    venueAddress: form.venueAddress,
    city: form.city,
    capacity: form.capacity,
    bannerKey: form.bannerKey ?? null,
    registrationOpen: form.registrationOpen,
    status: form.status
  }

  // only files uploaded since the last save need checking
  const savedKeys = eventId ? await imageKeys(eventId) : new Set<string | null>()
  await assertUploads([form.bannerKey, ...form.speakers.map(s => s.photoKey), ...form.partners.map(p => p.logoKey)]
    .filter(k => !savedKeys.has(k ?? null)))

  const staleKeys: (string | null)[] = []
  try {
    const id = await db.transaction(async (tx) => {
      let id = eventId
      if (id) {
        const [prev] = await tx.select().from(events).where(eq(events.id, id)).for('update')
        if (!prev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
        if (prev.code !== form.code && prev.registrationSeq > 0) {
          throw createError({ statusCode: 409, statusMessage: 'The event code cannot change once people have registered' })
        }
        if (prev.bannerKey !== values.bannerKey) staleKeys.push(prev.bannerKey)
        await tx.update(events).set({
          ...values,
          publishedAt: form.status === 'published' ? (prev.publishedAt ?? new Date()) : prev.publishedAt
        }).where(eq(events.id, id))
      } else {
        const [created] = await tx.insert(events).values({
          ...values,
          createdBy: actor.id,
          publishedAt: form.status === 'published' ? new Date() : null
        }).returning({ id: events.id })
        id = created!.id
      }

      // (event_id, sort_order) is unique: negate first so renumbering cannot collide
      await tx.update(agendaDays).set({ sortOrder: sql`-${agendaDays.sortOrder}` }).where(eq(agendaDays.eventId, id))
      const days = await syncChildren(tx, agendaDays, id, form.agendaDays, (d, i) => ({
        sortOrder: i + 1, label: d.label, date: d.date, theme: d.theme, body: d.body
      }))
      const oldSpeakers = await tx.select({ id: speakers.id, photoKey: speakers.photoKey }).from(speakers).where(eq(speakers.eventId, id))
      await syncChildren(tx, speakers, id, form.speakers, (s, i) => ({
        name: s.name, title: s.title, category: s.category, status: s.status, sortOrder: i + 1,
        photoKey: s.photoKey ?? null,
        agendaDayId: s.agendaDayIndex != null ? days.ids[s.agendaDayIndex] ?? null : null
      }))
      const oldPartners = await tx.select({ id: partners.id, logoKey: partners.logoKey }).from(partners).where(eq(partners.eventId, id))
      await syncChildren(tx, partners, id, form.partners, (p, i) => ({
        name: p.name, category: p.category, logoKey: p.logoKey ?? null, sortOrder: i + 1
      }))
      await syncChildren(tx, ticketTypes, id, form.ticketTypes, (t, i) => ({
        code: t.code, name: t.name, price: t.price, paxPerTicket: t.paxPerTicket, quota: t.quota, isOnSale: t.isOnSale, sortOrder: i + 1
      }))

      // old files that were replaced or removed
      const newPhotos = new Set(form.speakers.map(s => s.photoKey))
      const newLogos = new Set(form.partners.map(p => p.logoKey))
      staleKeys.push(...oldSpeakers.map(s => s.photoKey).filter(k => k && !newPhotos.has(k)))
      staleKeys.push(...oldPartners.map(p => p.logoKey).filter(k => k && !newLogos.has(k)))
      return id
    })
    await deleteObjects(staleKeys)
    return id
  } catch (err: unknown) {
    throw translateDbError(err)
  }
}

/** Image keys an event currently uses. */
async function imageKeys(eventId: string) {
  const [ev, sp, pa] = await Promise.all([
    db.select({ k: events.bannerKey }).from(events).where(eq(events.id, eventId)),
    db.select({ k: speakers.photoKey }).from(speakers).where(eq(speakers.eventId, eventId)),
    db.select({ k: partners.logoKey }).from(partners).where(eq(partners.eventId, eventId))
  ])
  return new Set([...ev, ...sp, ...pa].map(r => r.k))
}

/** Readable messages for constraint violations. */
function translateDbError(err: unknown) {
  if ((err as { statusCode?: number }).statusCode) return err
  const { code, constraint = '' } = pgError(err)
  if (code === '23505') {
    if (constraint.includes('slug')) return createError({ statusCode: 409, statusMessage: 'Another event already uses this slug' })
    if (constraint.includes('code')) return createError({ statusCode: 409, statusMessage: 'This code is already used' })
    return createError({ statusCode: 409, statusMessage: 'Duplicate data' })
  }
  if (code === '23503') {
    return createError({ statusCode: 409, statusMessage: 'A ticket type that participants already use cannot be deleted. Turn off "On sale" instead.' })
  }
  return err
}

export async function deleteEvent(id: string) {
  const keys = await db.transaction(async (tx) => {
    const [ev] = await tx.select().from(events).where(eq(events.id, id))
    if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    // a pending invoice can still be paid through its DOKU link, so it counts as money too
    const [money] = await tx.select({ n: sql<number>`count(*)::int` }).from(transactions)
      .where(and(eq(transactions.eventId, id), inArray(transactions.status, MONEY_STATUSES)))
    if (money && money.n > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `This event has ${money.n} active or paid ${money.n === 1 ? 'transaction' : 'transactions'}. Archive it instead of deleting.`
      })
    }
    const files = [
      ev.bannerKey,
      ...(await tx.select({ k: speakers.photoKey }).from(speakers).where(eq(speakers.eventId, id))).map(r => r.k),
      ...(await tx.select({ k: partners.logoKey }).from(partners).where(eq(partners.eventId, id))).map(r => r.k)
    ]
    // participants first: ticket_types → participants is RESTRICT
    await tx.delete(participants).where(eq(participants.eventId, id))
    await tx.delete(events).where(eq(events.id, id))
    return files
  })
  await deleteObjects(keys)
}

/** How much data a delete removes, for the confirmation dialog. `transactions` > 0 means it cannot be deleted. */
export async function deleteImpact(ids: string[]) {
  if (!ids.length) return new Map<string, { days: number, speakers: number, partners: number, tickets: number, participants: number, transactions: number }>()
  const count = (table: typeof agendaDays | typeof speakers | typeof partners | typeof ticketTypes | typeof participants) =>
    db.select({ eventId: table.eventId, n: sql<number>`count(*)::int` }).from(table).where(inArray(table.eventId, ids)).groupBy(table.eventId)
  const [d, s, p, t, pa, tr] = await Promise.all([
    count(agendaDays), count(speakers), count(partners), count(ticketTypes), count(participants),
    db.select({ eventId: transactions.eventId, n: sql<number>`count(*)::int` }).from(transactions)
      .where(and(inArray(transactions.eventId, ids), inArray(transactions.status, MONEY_STATUSES))).groupBy(transactions.eventId)
  ])
  const get = (rows: { eventId: string | null, n: number }[], id: string) => rows.find(r => r.eventId === id)?.n ?? 0
  return new Map(ids.map(id => [id, {
    days: get(d, id), speakers: get(s, id), partners: get(p, id), tickets: get(t, id), participants: get(pa, id), transactions: get(tr, id)
  }]))
}

/**
 * Takes an event off the website: public pages and registration only serve `published` events.
 * Editing it later saves it back as a draft or published event.
 */
export async function archiveEvent(id: string) {
  const [ev] = await db.update(events).set({ status: 'archived' }).where(eq(events.id, id)).returning({ id: events.id })
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
}
