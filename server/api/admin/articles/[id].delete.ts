import { deleteArticle } from '~~/server/services/articles'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await deleteArticle(parseId(event))
  return { ok: true }
})
