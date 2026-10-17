import { articleFormSchema } from '~~/shared/schemas/article'
import { saveArticle } from '~~/server/services/articles'

export default defineEventHandler(async (event) => {
  const admin = await requirePermission(event, 'news.manage')
  const form = await parseBody(event, articleFormSchema)
  return { id: await saveArticle(form, admin) }
})
