import { deleteArticle } from '~~/server/services/articles'

export default defineEventHandler(event => bulkDelete(event, 'news.manage', deleteArticle))
