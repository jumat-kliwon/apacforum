import { asc, eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { partners } from '~~/server/db/schema'
import { publicUrl } from '~~/server/services/storage'

/** Partners marked "Show on home page" in the CMS, for the home page's partners section. */
export default defineEventHandler(async () => {
  const rows = await db.select({ id: partners.id, name: partners.name, category: partners.category, logoKey: partners.logoKey })
    .from(partners)
    .where(eq(partners.showHome, true))
    .orderBy(asc(partners.sortOrder), asc(partners.name))
  return rows.map(({ logoKey, ...p }) => ({ ...p, logoUrl: publicUrl(logoKey) }))
})
