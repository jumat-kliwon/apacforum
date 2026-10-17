import { roleFormSchema } from '~~/shared/schemas/access'
import { createRole } from '~~/server/services/access'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'access.manage')
  const form = await parseBody(event, roleFormSchema)
  return { id: await createRole((await getStaff(event))!, form) }
})
