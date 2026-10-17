import { deleteArticle } from '~~/server/services/articles'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  await deleteArticle(parseId(event))
  return { ok: true }
})
