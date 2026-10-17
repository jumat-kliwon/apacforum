import { rejectSchema } from '~~/shared/schemas/participant'
import { rejectParticipant } from '~~/server/services/registration'

export default defineEventHandler(async (event) => {
  const admin = await requireStaff(event)
  const { reason } = await parseBody(event, rejectSchema)
  await rejectParticipant(parseId(event), reason, { id: admin.id, name: admin.name })
  return { ok: true }
})
