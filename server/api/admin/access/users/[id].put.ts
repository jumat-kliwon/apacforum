import { staffUpdateSchema } from '~~/shared/schemas/access'
import { updateStaff } from '~~/server/services/access'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'access.manage')
  const id = parseId(event)
  const input = await parseBody(event, staffUpdateSchema)
  await updateStaff((await getStaff(event))!, id, input)
  return { ok: true }
})
