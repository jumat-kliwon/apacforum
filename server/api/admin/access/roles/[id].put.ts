import { roleFormSchema } from '~~/shared/schemas/access'
import { updateRole } from '~~/server/services/access'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'access.manage')
  const id = parseId(event)
  const form = await parseBody(event, roleFormSchema)
  await updateRole((await getStaff(event))!, id, form)
  return { ok: true }
})
