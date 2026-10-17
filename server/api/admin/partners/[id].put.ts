import { partnerFormSchema } from '~~/shared/schemas/event'
import { updatePartner } from '~~/server/services/partners'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const id = parseId(event)
  const form = await parseBody(event, partnerFormSchema)
  return { id: await updatePartner(id, form) }
})
