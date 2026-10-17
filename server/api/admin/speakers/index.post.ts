import { speakerFormSchema } from '~~/shared/schemas/event'
import { createSpeaker } from '~~/server/services/speakers'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'events.manage')
  const form = await parseBody(event, speakerFormSchema)
  return { id: await createSpeaker(form) }
})
