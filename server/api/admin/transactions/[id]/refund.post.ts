import { refundSchema } from '~~/shared/schemas/participant'
import { refund } from '~~/server/services/payment'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const { note } = await parseBody(event, refundSchema)
  const trx = await refund(parseId(event), { id: admin.id, name: admin.name }, note)
  return { id: trx.id, status: trx.status }
})
