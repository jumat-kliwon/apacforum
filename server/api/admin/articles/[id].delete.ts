import { deleteArticle } from '~~/server/services/articles'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'news.manage')
  await deleteArticle(parseId(event))
  return { ok: true }
})
