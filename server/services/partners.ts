import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm'
import type { z } from 'zod'
import type { PartnerForm, partnerListQuery } from '../../shared/schemas/event'
import { db } from '../db'
import { events, partners } from '../db/schema'
import { assertUploads, deleteObjects, publicUrl } from './storage'
import { likePattern } from '../utils/validate'

// ── partners (the Partners page) ──

const partnerValues = (f: PartnerForm) => ({
  name: f.name, category: f.category, logoKey: f.logoKey ?? null, showHome: f.showHome
})

export async function createPartner(form: PartnerForm) {
  await assertUploads([form.logoKey])
  return db.transaction(async (tx) => {
    const [ev] = await tx.select({ id: events.id }).from(events).where(eq(events.id, form.eventId)).for('update')
    if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    const [last] = await tx.select({ n: sql<number>`coalesce(max(${partners.sortOrder}), 0)::int` }).from(partners).where(eq(partners.eventId, form.eventId))
    const [row] = await tx.insert(partners).values({ ...partnerValues(form), eventId: form.eventId, sortOrder: (last?.n ?? 0) + 1 }).returning({ id: partners.id })
    return row!.id
  })
}

export async function updatePartner(id: string, form: PartnerForm) {
  const [prev] = await db.select({ logoKey: partners.logoKey }).from(partners)
    .where(and(eq(partners.id, id), eq(partners.eventId, form.eventId)))
  if (!prev) throw createError({ statusCode: 404, statusMessage: 'Partner not found' })
  // only a newly uploaded logo needs checking
  if (form.logoKey && form.logoKey !== prev.logoKey) await assertUploads([form.logoKey])
  await db.update(partners).set(partnerValues(form)).where(eq(partners.id, id))
  if (prev.logoKey && prev.logoKey !== (form.logoKey ?? null)) await deleteObjects([prev.logoKey])
  return id
}

export async function deletePartner(id: string) {
  const [row] = await db.delete(partners).where(eq(partners.id, id)).returning({ logoKey: partners.logoKey })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Partner not found' })
  await deleteObjects([row.logoKey])
}

export const partnerSelect = {
  id: partners.id,
  eventId: partners.eventId,
  eventName: events.name,
  name: partners.name,
  category: partners.category,
  logoKey: partners.logoKey,
  showHome: partners.showHome,
  sortOrder: partners.sortOrder,
  updatedAt: partners.updatedAt
}

export const withLogoUrl = <T extends { logoKey: string | null }>(p: T) => ({ ...p, logoUrl: publicUrl(p.logoKey) })

export async function listPartners(q: z.output<typeof partnerListQuery>) {
  const where = and(
    q.q ? ilike(partners.name, likePattern(q.q)) : undefined,
    q.eventId ? eq(partners.eventId, q.eventId) : undefined,
    q.category ? eq(partners.category, q.category) : undefined,
    q.home ? eq(partners.showHome, q.home === 'shown') : undefined
  )
  const sortCol = { order: partners.sortOrder, name: partners.name, category: partners.category, home: partners.showHome }[q.sort]
  const order = q.dir === 'asc' ? asc(sortCol) : desc(sortCol)
  const [rows, [count]] = await Promise.all([
    db.select(partnerSelect).from(partners)
      .innerJoin(events, eq(events.id, partners.eventId))
      .where(where)
      .orderBy(order, asc(partners.sortOrder))
      .limit(q.pageSize).offset((q.page - 1) * q.pageSize),
    db.select({ total: sql<number>`count(*)::int` }).from(partners).where(where)
  ])
  return {
    rows: rows.map(withLogoUrl),
    total: count?.total ?? 0
  }
}
