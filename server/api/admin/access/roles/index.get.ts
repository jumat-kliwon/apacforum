import { listRoles } from '~~/server/services/access'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'access.manage')
  return { roles: await listRoles() }
})
