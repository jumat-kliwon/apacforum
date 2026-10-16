import { partnerListQuery } from '~~/shared/schemas/event'
import { listPartners } from '~~/server/services/partners'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return listPartners(parseQuery(event, partnerListQuery))
})
