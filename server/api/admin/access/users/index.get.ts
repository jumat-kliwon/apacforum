import { staffListQuery } from '~~/shared/schemas/access'
import { listStaff } from '~~/server/services/access'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'access.manage')
  return listStaff(parseQuery(event, staffListQuery))
})
