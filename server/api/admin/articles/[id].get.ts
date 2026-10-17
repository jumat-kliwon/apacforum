import { eq } from 'drizzle-orm'
import { db } from '~~/server/db'
import { articles, users } from '~~/server/db/schema'
import { publicUrl } from '~~/server/services/storage'

/** One article for the edit form. */
export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = parseId(event)
  const [row] = await db.select({ article: articles, authorName: users.name }).from(articles)
    .leftJoin(users, eq(users.id, articles.authorId))
    .where(eq(articles.id, id))
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  return {
    ...row.article,
    authorName: row.authorName,
    thumbnailUrl: publicUrl(row.article.thumbnailKey),
    ogImageUrl: publicUrl(row.article.ogImageKey)
  }
})
