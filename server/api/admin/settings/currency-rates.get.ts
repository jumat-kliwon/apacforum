import { listRates } from '~~/server/services/currency'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'settings.manage')
  return listRates()
})
