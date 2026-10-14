import { and, desc, eq, lte, sql } from 'drizzle-orm'
import * as z from 'zod'
import { db } from '~~/server/db'
import { articles } from '~~/server/db/schema'
import { publicUrl } from '~~/server/services/storage'

const query = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(9)
})

/** Published articles, newest first — the /news page. Scheduled (future-dated) articles stay hidden. */
export default defineEventHandler(async (event) => {
  const q = parseQuery(event, query)
  const where = and(eq(articles.status, 'published'), lte(articles.publishedAt, sql`now()`))
  const [rows, [count]] = await Promise.all([
    db.select({
      id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt,
      thumbnailKey: articles.thumbnailKey, publishedAt: articles.publishedAt
    }).from(articles).where(where)
      .orderBy(desc(articles.publishedAt), desc(articles.id))
      .limit(q.pageSize).offset((q.page - 1) * q.pageSize),
    db.select({ n: sql<number>`count(*)::int` }).from(articles).where(where)
  ])
  return {
    rows: rows.map(({ thumbnailKey, ...r }) => ({ ...r, thumbnailUrl: publicUrl(thumbnailKey) })),
    total: count?.n ?? 0
  }
})
