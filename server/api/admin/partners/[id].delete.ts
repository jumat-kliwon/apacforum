import { deletePartner } from '~~/server/services/partners'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  await deletePartner(parseId(event))
  return { ok: true }
})
