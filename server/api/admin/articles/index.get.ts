import { articleListQuery } from '~~/shared/schemas/article'
import { listArticles } from '~~/server/services/articles'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'news.manage')
  return listArticles(parseQuery(event, articleListQuery))
})
