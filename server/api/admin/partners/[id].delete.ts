import { deletePartner } from '~~/server/services/partners'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await deletePartner(parseId(event))
  return { ok: true }
})
