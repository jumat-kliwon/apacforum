import { asc, eq, sql } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { db } from '../db'
import { partners, speakers, ticketTypes } from '../db/schema'
import { publicUrl } from './storage'
import { PARTNER_CATEGORY, SPEAKER_CATEGORY } from '../../shared/utils/labels'

// ── manual ordering (the Reorder pages of Speakers, Partners and Tickets) ──

export type ReorderKind = 'speakers' | 'partners' | 'tickets'

const TABLES = { speakers, partners, tickets: ticketTypes } as const

/** The `[kind]` route param; anything else is a 404. */
export function parseReorderKind(event: H3Event): ReorderKind {
  const kind = getRouterParam(event, 'kind') ?? ''
  if (!Object.hasOwn(TABLES, kind)) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return kind as ReorderKind
}

/** One row on a Reorder page. */
export type ReorderItem = { id: string, title: string, subtitle: string, imageUrl: string | null }

/** Every row of the event, in the current order (lower `sortOrder` first, ties by name). */
export async function listForReorder(kind: ReorderKind, eventId: string): Promise<ReorderItem[]> {
  if (kind === 'speakers') {
    const rows = await db.select({ id: speakers.id, name: speakers.name, title: speakers.title, category: speakers.category, photoKey: speakers.photoKey })
      .from(speakers).where(eq(speakers.eventId, eventId)).orderBy(asc(speakers.sortOrder), asc(speakers.name))
    return rows.map(r => ({ id: r.id, title: r.name, subtitle: `${SPEAKER_CATEGORY[r.category]} · ${r.title}`, imageUrl: publicUrl(r.photoKey) }))
  }
  if (kind === 'partners') {
    const rows = await db.select({ id: partners.id, name: partners.name, category: partners.category, logoKey: partners.logoKey })
      .from(partners).where(eq(partners.eventId, eventId)).orderBy(asc(partners.sortOrder), asc(partners.name))
    return rows.map(r => ({ id: r.id, title: r.name, subtitle: PARTNER_CATEGORY[r.category], imageUrl: publicUrl(r.logoKey) }))
  }
  const rows = await db.select({ id: ticketTypes.id, name: ticketTypes.name, code: ticketTypes.code, isOnSale: ticketTypes.isOnSale })
    .from(ticketTypes).where(eq(ticketTypes.eventId, eventId)).orderBy(asc(ticketTypes.sortOrder), asc(ticketTypes.name))
  return rows.map(r => ({ id: r.id, title: r.name, subtitle: `${r.code} · ${r.isOnSale ? 'On sale' : 'Not on sale'}`, imageUrl: null }))
}

/**
 * Saves a new order: `ids[0]` gets 0, `ids[1]` gets 1, and so on.
 * `ids` must be exactly the event's rows — if someone added or deleted one meanwhile, the save is refused.
 */
export async function saveOrder(kind: ReorderKind, eventId: string, ids: string[]) {
  const t = TABLES[kind]
  await db.transaction(async (tx) => {
    const current = await tx.execute<{ id: string }>(sql`select ${t.id} as id from ${t} where ${t.eventId} = ${eventId} for update`)
    const known = new Set(Array.from(current, r => r.id))
    if (known.size !== ids.length || ids.some(id => !known.has(id))) {
      throw createError({ statusCode: 409, statusMessage: 'The list changed while you were reordering. Reload the page and try again.' })
    }
    const idArray = sql`array[${sql.join(ids.map(id => sql`${id}`), sql`, `)}]::uuid[]`
    await tx.execute(sql`
      update ${t} set sort_order = v.ord - 1
      from unnest(${idArray}) with ordinality as v(id, ord)
      where ${t.id} = v.id and ${t.eventId} = ${eventId}`)
  })
}
