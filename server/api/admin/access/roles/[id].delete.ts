import { deleteRole } from '~~/server/services/access'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'access.manage')
  await deleteRole((await getStaff(event))!, parseId(event))
  return { ok: true }
})
