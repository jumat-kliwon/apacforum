import { transactionListQuery } from '~~/shared/schemas/participant'
import { listTransactions } from '~~/server/services/lists'

export default defineEventHandler(async (event) => {
  await requireSuperadmin(event)
  return listTransactions(parseQuery(event, transactionListQuery))
})
