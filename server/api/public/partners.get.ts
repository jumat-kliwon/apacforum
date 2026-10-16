import { and, asc, eq } from 'drizzle-orm'
import * as z from 'zod'
import { db } from '~~/server/db'
import { events, partners } from '~~/server/db/schema'
import { publicUrl } from '~~/server/services/storage'

const query = z.object({
  /** `home`: partners marked "Show on home page". `event`: every partner of the published default event (/partners). */
  scope: z.enum(['home', 'event']).default('home')
})

export default defineEventHandler(async (event) => {
  const { scope } = parseQuery(event, query)
  const where = scope === 'home'
    ? eq(partners.showHome, true)
    : and(eq(events.isDefault, true), eq(events.status, 'published'))
  const rows = await db.select({ id: partners.id, name: partners.name, category: partners.category, logoKey: partners.logoKey })
    .from(partners)
    .innerJoin(events, eq(events.id, partners.eventId))
    .where(where)
    .orderBy(asc(partners.sortOrder), asc(partners.name))
  return rows.map(({ logoKey, ...p }) => ({ ...p, logoUrl: publicUrl(logoKey) }))
})
