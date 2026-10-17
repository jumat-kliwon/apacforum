import { transactionListQuery } from '~~/shared/schemas/participant'
import { listTransactions } from '~~/server/services/lists'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'transactions.manage')
  return listTransactions(parseQuery(event, transactionListQuery))
})
