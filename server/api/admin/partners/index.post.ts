import { partnerFormSchema } from '~~/shared/schemas/event'
import { createPartner } from '~~/server/services/partners'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const form = await parseBody(event, partnerFormSchema)
  return { id: await createPartner(form) }
})
