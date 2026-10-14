import { and, desc, eq, lte, ne, sql } from 'drizzle-orm'
import { db } from '~~/server/db'
import { articles, users } from '~~/server/db/schema'
import { publicUrl } from '~~/server/services/storage'

/** One published article plus a few recent ones to read next. */
export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') ?? '').toLowerCase()
  const live = and(eq(articles.status, 'published'), lte(articles.publishedAt, sql`now()`))
  const [row] = await db.select({ article: articles, authorName: users.name }).from(articles)
    .leftJoin(users, eq(users.id, articles.authorId))
    .where(and(eq(articles.slug, slug), live))
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  const a = row.article

  const more = await db.select({
    id: articles.id, title: articles.title, slug: articles.slug, thumbnailKey: articles.thumbnailKey, publishedAt: articles.publishedAt
  }).from(articles).where(and(live, ne(articles.id, a.id))).orderBy(desc(articles.publishedAt)).limit(3)

  return {
    article: {
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: a.content,
      publishedAt: a.publishedAt,
      updatedAt: a.updatedAt,
      authorName: row.authorName,
      thumbnailUrl: publicUrl(a.thumbnailKey),
      seo: {
        title: a.seoTitle || a.title,
        description: a.seoDescription || a.excerpt || '',
        keywords: a.seoKeywords,
        image: publicUrl(a.ogImageKey) ?? publicUrl(a.thumbnailKey),
        canonicalUrl: a.canonicalUrl,
        noIndex: a.noIndex
      }
    },
    more: more.map(({ thumbnailKey, ...m }) => ({ ...m, thumbnailUrl: publicUrl(thumbnailKey) }))
  }
})
