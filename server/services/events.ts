import { and, eq, inArray, notInArray, sql } from 'drizzle-orm'
import type { EventForm } from '../../shared/schemas/event'
import { db } from '../db'
import { agendaDays, events, partners, participants, speakers, ticketTypes } from '../db/schema'
import { deadlineFromDate } from './registration'
import { deleteObjects } from './storage'
import type { Tx } from './context'
import { pgError } from '../utils/db-error'

type Actor = { id: string }

/** Sinkronkan baris anak: hapus yang dibuang, update yang ada, insert yang baru. */
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
      if (!u) throw createError({ statusCode: 422, statusMessage: 'Data turunan tidak cocok dengan event ini' })
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
    description: form.description,
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

  const staleKeys: (string | null)[] = []
  try {
    const id = await db.transaction(async (tx) => {
      let id = eventId
      if (id) {
        const [prev] = await tx.select().from(events).where(eq(events.id, id)).for('update')
        if (!prev) throw createError({ statusCode: 404, statusMessage: 'Event tidak ditemukan' })
        if (prev.code !== form.code && prev.registrationSeq > 0) {
          throw createError({ statusCode: 409, statusMessage: 'Kode event tidak bisa diubah setelah ada pendaftar' })
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

      // (event_id, sort_order) unik: negatifkan dulu supaya penomoran ulang tidak bentrok
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

      // file lama yang diganti / dibuang
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

/** Pesan yang bisa dibaca admin untuk pelanggaran constraint. */
function translateDbError(err: unknown) {
  if ((err as { statusCode?: number }).statusCode) return err
  const { code, constraint = '' } = pgError(err)
  if (code === '23505') {
    if (constraint.includes('slug')) return createError({ statusCode: 409, statusMessage: 'Slug sudah dipakai event lain' })
    if (constraint.includes('code')) return createError({ statusCode: 409, statusMessage: 'Kode sudah dipakai' })
    return createError({ statusCode: 409, statusMessage: 'Data duplikat' })
  }
  if (code === '23503') {
    return createError({ statusCode: 409, statusMessage: 'Tipe tiket yang sudah dipakai peserta tidak bisa dihapus. Matikan "Dijual" saja.' })
  }
  return err
}

export async function deleteEvent(id: string) {
  const keys = await db.transaction(async (tx) => {
    const [ev] = await tx.select().from(events).where(eq(events.id, id))
    if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event tidak ditemukan' })
    const files = [
      ev.bannerKey,
      ...(await tx.select({ k: speakers.photoKey }).from(speakers).where(eq(speakers.eventId, id))).map(r => r.k),
      ...(await tx.select({ k: partners.logoKey }).from(partners).where(eq(partners.eventId, id))).map(r => r.k)
    ]
    // peserta dulu: ticket_types → participants memakai RESTRICT
    await tx.delete(participants).where(eq(participants.eventId, id))
    await tx.delete(events).where(eq(events.id, id))
    return files
  })
  await deleteObjects(keys)
}

/** Jumlah data yang ikut terhapus — untuk teks dialog konfirmasi. */
export async function deleteImpact(ids: string[]) {
  if (!ids.length) return new Map<string, { days: number, speakers: number, partners: number, tickets: number, participants: number }>()
  const count = (table: typeof agendaDays | typeof speakers | typeof partners | typeof ticketTypes | typeof participants) =>
    db.select({ eventId: table.eventId, n: sql<number>`count(*)::int` }).from(table).where(inArray(table.eventId, ids)).groupBy(table.eventId)
  const [d, s, p, t, pa] = await Promise.all([count(agendaDays), count(speakers), count(partners), count(ticketTypes), count(participants)])
  const get = (rows: { eventId: string, n: number }[], id: string) => rows.find(r => r.eventId === id)?.n ?? 0
  return new Map(ids.map(id => [id, { days: get(d, id), speakers: get(s, id), partners: get(p, id), tickets: get(t, id), participants: get(pa, id) }]))
}
