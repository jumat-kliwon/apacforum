import { articleListQuery } from '~~/shared/schemas/article'
import { listArticles } from '~~/server/services/articles'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return listArticles(parseQuery(event, articleListQuery))
})
