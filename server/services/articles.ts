import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm'
import type { z } from 'zod'
import type { ArticleForm, articleListQuery } from '../../shared/schemas/article'
import { db } from '../db'
import { articles, users } from '../db/schema'
import { deleteObjects, publicUrl } from './storage'
import { pgError } from '../utils/db-error'
import { likePattern } from '../utils/validate'

type Actor = { id: string }

/**
 * Defence in depth for editor HTML (only admins can write it): drops active content,
 * inline event handlers and script URLs. The editor itself only produces plain markup.
 */
const BLOCKED_TAGS = 'script|style|iframe|frame|frameset|object|embed|form|input|button|textarea|select|meta|link|base|svg|math|template|noscript'

export function sanitizeHtml(html: string) {
  return html
    // whole elements with their content, then any stray opening/closing tag
    .replace(new RegExp(`<\\s*(${BLOCKED_TAGS})\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, 'gi'), '')
    .replace(new RegExp(`<\\s*\\/?\\s*(${BLOCKED_TAGS})\\b[^>]*>`, 'gi'), '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src|xlink:href|formaction)\s*=\s*("|')?\s*(javascript|vbscript|data(?!:image\/(png|jpe?g|gif|webp);))[^"'>\s]*\2?/gi, ' $1="#"')
}

/** `2026-10-14T09:30` from a datetime-local input means WIB. */
function parsePublishedAt(v: string | null) {
  if (!v) return null
  return new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(v) ? v : `${v}${v.length === 16 ? ':00' : ''}+07:00`)
}

export async function saveArticle(form: ArticleForm, actor: Actor, articleId?: string) {
  const chosenDate = parsePublishedAt(form.publishedAt)
  const values = {
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt,
    content: sanitizeHtml(form.content),
    thumbnailKey: form.thumbnailKey ?? null,
    status: form.status,
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    seoKeywords: form.seoKeywords,
    ogImageKey: form.ogImageKey ?? null,
    canonicalUrl: form.canonicalUrl,
    noIndex: form.noIndex
  }

  const staleKeys: (string | null)[] = []
  try {
    const id = await db.transaction(async (tx) => {
      if (articleId) {
        const [prev] = await tx.select().from(articles).where(eq(articles.id, articleId)).for('update')
        if (!prev) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
        if (prev.thumbnailKey !== values.thumbnailKey) staleKeys.push(prev.thumbnailKey)
        if (prev.ogImageKey !== values.ogImageKey) staleKeys.push(prev.ogImageKey)
        await tx.update(articles).set({
          ...values,
          publishedAt: chosenDate ?? (form.status === 'published' ? (prev.publishedAt ?? new Date()) : prev.publishedAt)
        }).where(eq(articles.id, articleId))
        return articleId
      }
      const [created] = await tx.insert(articles).values({
        ...values,
        authorId: actor.id,
        publishedAt: chosenDate ?? (form.status === 'published' ? new Date() : null)
      }).returning({ id: articles.id })
      return created!.id
    })
    await deleteObjects(staleKeys)
    return id
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode) throw err
    const { code, constraint = '' } = pgError(err)
    if (code === '23505' && constraint.includes('slug')) {
      throw createError({ statusCode: 409, statusMessage: 'Another article already uses this slug' })
    }
    throw err
  }
}

export async function deleteArticle(id: string) {
  const [row] = await db.delete(articles).where(eq(articles.id, id)).returning({ thumbnailKey: articles.thumbnailKey, ogImageKey: articles.ogImageKey })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  await deleteObjects([row.thumbnailKey, row.ogImageKey])
}

const sortCols = {
  title: articles.title,
  status: articles.status,
  published: articles.publishedAt,
  updated: articles.updatedAt
} as const

export async function listArticles(q: z.output<typeof articleListQuery>) {
  const where = and(
    q.q ? ilike(articles.title, likePattern(q.q)) : undefined,
    q.status ? eq(articles.status, q.status) : undefined
  )
  const order = q.dir === 'asc' ? asc(sortCols[q.sort]) : desc(sortCols[q.sort])
  const [rows, [count]] = await Promise.all([
    db.select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      thumbnailKey: articles.thumbnailKey,
      status: articles.status,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      authorName: users.name
    }).from(articles)
      .leftJoin(users, eq(users.id, articles.authorId))
      .where(where)
      .orderBy(order, desc(articles.id))
      .limit(q.pageSize)
      .offset((q.page - 1) * q.pageSize),
    db.select({ n: sql<number>`count(*)::int` }).from(articles).where(where)
  ])
  return {
    rows: rows.map(({ thumbnailKey, ...r }) => ({ ...r, thumbnailUrl: publicUrl(thumbnailKey) })),
    total: count?.n ?? 0
  }
}
