import { staffCreateSchema } from '~~/shared/schemas/access'
import { createStaff } from '~~/server/services/access'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'access.manage')
  const input = await parseBody(event, staffCreateSchema)
  return { id: await createStaff((await getStaff(event))!, input) }
})
