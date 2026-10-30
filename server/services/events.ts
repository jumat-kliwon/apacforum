import { and, asc, desc, eq, ilike, inArray, notInArray, or, sql } from 'drizzle-orm'
import type { z } from 'zod'
import type { EventForm, TicketTypeForm, ticketTypeListQuery } from '../../shared/schemas/event'
import { toMinor, type Currency } from '../../shared/utils/money'
import { db } from '../db'
import { agendaDays, events, partners, participants, speakers, ticketTypes, transactions } from '../db/schema'
import { deadlineFromDate } from './registration'
import { assertUploads, deleteObjects } from './storage'
import type { Tx } from './context'
import { pgError } from '../utils/db-error'
import { likePattern } from '../utils/validate'
import { sanitizeDescription } from '../utils/sanitizeDescription'

type Actor = { id: string }

/** Transaction states that hold money or may still receive it. An event with any of these is archived, not deleted. */
const MONEY_STATUSES: ('pending' | 'paid' | 'refunded')[] = ['pending', 'paid', 'refunded']

/** Syncs child rows: delete removed ones, update existing ones, insert new ones. */
async function syncChildren<T extends { id?: string }>(
  tx: Tx,
  table: typeof agendaDays | typeof ticketTypes,
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
    currency: form.currency,
    bannerKey: form.bannerKey ?? null,
    registrationOpen: form.registrationOpen,
    isDefault: form.isDefault,
    status: form.status
  }

  // only a newly uploaded banner needs checking
  const savedBanner = eventId ? await bannerKey(eventId) : null
  if (form.bannerKey && form.bannerKey !== savedBanner) await assertUploads([form.bannerKey])

  const staleKeys: (string | null)[] = []
  try {
    const id = await db.transaction(async (tx) => {
      let id = eventId
      // one default at a time: hand it over before this row claims it
      if (form.isDefault) {
        await tx.update(events).set({ isDefault: false })
          .where(eventId ? and(eq(events.isDefault, true), sql`${events.id} <> ${eventId}`) : eq(events.isDefault, true))
      }
      if (id) {
        const [prev] = await tx.select().from(events).where(eq(events.id, id)).for('update')
        if (!prev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
        if (prev.code !== form.code && prev.registrationSeq > 0) {
          throw createError({ statusCode: 409, statusMessage: 'The event code cannot change once people have registered' })
        }
        // prices are stored in minor units of the currency, so switching would re-read 2,500,000 rupiah as US$ 25,000.00
        if (prev.currency !== form.currency && await hasPaidTicketTypes(tx, id)) {
          throw createError({ statusCode: 409, statusMessage: 'The currency cannot change while the event has paid ticket types. Set their prices to 0 or remove them first.' })
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
      // speakers of a removed day keep their place with no session (agenda_day_id is ON DELETE SET NULL)
      await syncChildren(tx, agendaDays, id, form.agendaDays, (d, i) => ({
        sortOrder: i + 1, label: d.label, date: d.date, theme: d.theme, body: d.body
      }))
      if (form.status === 'published') await requireTicketTypes(tx, id)
      return id
    })
    await deleteObjects(staleKeys)
    return id
  } catch (err: unknown) {
    throw translateDbError(err)
  }
}

/** True when a ticket type of the event costs money; its price would be re-read in a new currency. */
export async function hasPaidTicketTypes(d: Tx | typeof db, eventId: string) {
  const [row] = await d.select({ n: sql<number>`count(*)::int` }).from(ticketTypes).where(and(eq(ticketTypes.eventId, eventId), sql`${ticketTypes.price} > 0`))
  return (row?.n ?? 0) > 0
}

/** A published event must sell at least one ticket type (managed on the Tickets page). */
async function requireTicketTypes(tx: Tx, eventId: string) {
  const [row] = await tx.select({ n: sql<number>`count(*)::int` }).from(ticketTypes).where(eq(ticketTypes.eventId, eventId))
  if (!row?.n) {
    throw createError({ statusCode: 422, statusMessage: 'Add at least one ticket type on the Tickets page before publishing this event' })
  }
}

// ── ticket types (the Tickets page) ──

/** The form's price is in major units; it is stored in minor units of the event's currency. */
function minorPrice(price: number, currency: Currency) {
  const minor = toMinor(price, currency)
  if (minor === null) {
    throw createError({ statusCode: 422, statusMessage: currency === 'IDR' ? 'Enter the price in whole rupiah' : 'Enter the price with at most 2 decimals' })
  }
  return minor
}

const ticketValues = (f: Omit<TicketTypeForm, 'eventId'>, currency: Currency) => ({
  code: f.code,
  name: f.name,
  price: minorPrice(f.price, currency),
  isEarlyBird: f.isEarlyBird,
  earlyBirdUntil: f.isEarlyBird && f.earlyBirdUntil ? deadlineFromDate(f.earlyBirdUntil) : null,
  paxPerTicket: f.paxPerTicket,
  quota: f.quota,
  isOnSale: f.isOnSale
})

export async function createTicketType(form: TicketTypeForm) {
  try {
    return await db.transaction(async (tx) => {
      const [ev] = await tx.select({ id: events.id, currency: events.currency }).from(events).where(eq(events.id, form.eventId)).for('update')
      if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
      const [last] = await tx.select({ n: sql<number>`coalesce(max(${ticketTypes.sortOrder}), 0)::int` }).from(ticketTypes).where(eq(ticketTypes.eventId, form.eventId))
      const [row] = await tx.insert(ticketTypes).values({ ...ticketValues(form, ev.currency), eventId: form.eventId, sortOrder: (last?.n ?? 0) + 1 }).returning({ id: ticketTypes.id })
      return row!.id
    })
  } catch (err: unknown) {
    throw translateDbError(err)
  }
}

export async function updateTicketType(id: string, form: TicketTypeForm) {
  try {
    return await db.transaction(async (tx) => {
      // lock the event so its currency cannot change between reading it and saving the price
      const [ev] = await tx.select({ currency: events.currency }).from(events).where(eq(events.id, form.eventId)).for('update')
      if (!ev) throw createError({ statusCode: 404, statusMessage: 'Ticket type not found' })
      const [row] = await tx.update(ticketTypes).set(ticketValues(form, ev.currency))
        .where(and(eq(ticketTypes.id, id), eq(ticketTypes.eventId, form.eventId)))
        .returning({ id: ticketTypes.id })
      if (!row) throw createError({ statusCode: 404, statusMessage: 'Ticket type not found' })
      return row.id
    })
  } catch (err: unknown) {
    throw translateDbError(err)
  }
}

export async function deleteTicketType(id: string) {
  try {
    await db.transaction(async (tx) => {
      const [t] = await tx.select({ eventId: ticketTypes.eventId, status: events.status }).from(ticketTypes)
        .innerJoin(events, eq(events.id, ticketTypes.eventId))
        .where(eq(ticketTypes.id, id))
        .for('update')
      if (!t) throw createError({ statusCode: 404, statusMessage: 'Ticket type not found' })
      if (t.status === 'published') {
        const [n] = await tx.select({ n: sql<number>`count(*)::int` }).from(ticketTypes).where(eq(ticketTypes.eventId, t.eventId))
        if ((n?.n ?? 0) <= 1) throw createError({ statusCode: 422, statusMessage: 'A published event needs at least one ticket type' })
      }
      await tx.delete(ticketTypes).where(eq(ticketTypes.id, id))
    })
  } catch (err: unknown) {
    throw translateDbError(err)
  }
}

/** Paid and registered counts per ticket type, as correlated subqueries. */
const soldCount = sql<number>`(select count(*) from ${participants} where ${participants.ticketTypeId} = ${ticketTypes.id} and ${participants.paymentStatus} = 'paid')::int`
const registeredCount = sql<number>`(select count(*) from ${participants} where ${participants.ticketTypeId} = ${ticketTypes.id} and ${participants.status} not in ('rejected', 'cancelled'))::int`
/** Any registration, even a rejected one, blocks deleting: participants → ticket_types is RESTRICT. */
const usedCount = sql<number>`(select count(*) from ${participants} where ${participants.ticketTypeId} = ${ticketTypes.id})::int`

export const ticketTypeSelect = {
  id: ticketTypes.id,
  eventId: ticketTypes.eventId,
  eventName: events.name,
  eventStatus: events.status,
  code: ticketTypes.code,
  name: ticketTypes.name,
  /** Minor units of `currency`. */
  price: ticketTypes.price,
  currency: events.currency,
  isEarlyBird: ticketTypes.isEarlyBird,
  earlyBirdUntil: ticketTypes.earlyBirdUntil,
  paxPerTicket: ticketTypes.paxPerTicket,
  quota: ticketTypes.quota,
  isOnSale: ticketTypes.isOnSale,
  createdAt: ticketTypes.createdAt,
  updatedAt: ticketTypes.updatedAt,
  sold: soldCount,
  registered: registeredCount,
  used: usedCount
}

export async function listTicketTypes(q: z.output<typeof ticketTypeListQuery>) {
  const where = and(
    q.q ? or(ilike(ticketTypes.name, likePattern(q.q)), ilike(ticketTypes.code, likePattern(q.q))) : undefined,
    q.eventId ? eq(ticketTypes.eventId, q.eventId) : undefined,
    q.status ? eq(ticketTypes.isOnSale, q.status === 'on_sale') : undefined
  )
  const sortCol = { name: ticketTypes.name, event: events.startDate, price: ticketTypes.price, sold: soldCount, status: ticketTypes.isOnSale }[q.sort]
  const dir = q.dir === 'asc' ? asc : desc
  // prices of different currencies are not comparable: group them by currency first
  const order = q.sort === 'price' ? [dir(events.currency), dir(sortCol)] : [dir(sortCol)]
  const [rows, [count]] = await Promise.all([
    db.select(ticketTypeSelect).from(ticketTypes)
      .innerJoin(events, eq(events.id, ticketTypes.eventId))
      .where(where)
      .orderBy(...order, asc(events.name), asc(ticketTypes.sortOrder))
      .limit(q.pageSize).offset((q.page - 1) * q.pageSize),
    db.select({ total: sql<number>`count(*)::int` }).from(ticketTypes).where(where)
  ])
  return { rows, total: count?.total ?? 0 }
}

/** Publish or unpublish without touching the rest of the event (event detail page). */
export async function setEventStatus(eventId: string, status: 'draft' | 'published') {
  await db.transaction(async (tx) => {
    const [ev] = await tx.select({ publishedAt: events.publishedAt }).from(events).where(eq(events.id, eventId)).for('update')
    if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    if (status === 'published') await requireTicketTypes(tx, eventId)
    await tx.update(events).set({
      status,
      publishedAt: status === 'published' ? (ev.publishedAt ?? new Date()) : ev.publishedAt
    }).where(eq(events.id, eventId))
  })
}

/**
 * Makes an event the website's default, or clears it. Setting one clears the previous default
 * in the same transaction; the `events_single_default` index backs this up under concurrency.
 */
export async function setDefaultEvent(eventId: string, isDefault: boolean) {
  try {
    await db.transaction(async (tx) => {
      const [ev] = await tx.select({ status: events.status }).from(events).where(eq(events.id, eventId)).for('update')
      if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
      if (isDefault && ev.status === 'archived') {
        throw createError({ statusCode: 409, statusMessage: 'An archived event cannot be the default event' })
      }
      if (isDefault) await tx.update(events).set({ isDefault: false }).where(and(eq(events.isDefault, true), sql`${events.id} <> ${eventId}`))
      await tx.update(events).set({ isDefault }).where(eq(events.id, eventId))
    })
  } catch (err) {
    throw translateDbError(err)
  }
}

/** The banner the event has saved. */
async function bannerKey(eventId: string) {
  const [ev] = await db.select({ k: events.bannerKey }).from(events).where(eq(events.id, eventId))
  return ev?.k ?? null
}

/** Readable messages for constraint violations. */
function translateDbError(err: unknown) {
  if ((err as { statusCode?: number }).statusCode) return err
  const { code, constraint = '' } = pgError(err)
  if (code === '23505') {
    if (constraint === 'events_single_default') return createError({ statusCode: 409, statusMessage: 'Another event was just made the default. Reload and try again.' })
    if (constraint.includes('slug')) return createError({ statusCode: 409, statusMessage: 'Another event already uses this slug' })
    if (constraint.includes('ticket_types')) return createError({ statusCode: 409, statusMessage: 'This event already has a ticket type with this code' })
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
    // FOR UPDATE: invoice creation bumps events.invoice_seq, so it waits for us (or we for it) and the count below is current
    const [ev] = await tx.select().from(events).where(eq(events.id, id)).for('update')
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
 * An archived event also stops being the default.
 * Editing it later saves it back as a draft or published event.
 */
export async function archiveEvent(id: string) {
  const [ev] = await db.update(events).set({ status: 'archived', isDefault: false }).where(eq(events.id, id)).returning({ id: events.id })
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
}
