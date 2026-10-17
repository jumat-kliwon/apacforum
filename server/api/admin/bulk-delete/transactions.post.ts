import { deleteTransaction } from '~~/server/services/payment'

/** Any status, paid ones included: the admin chose to drop the financial record. */
export default defineEventHandler(event => bulkDelete(event, deleteTransaction))
