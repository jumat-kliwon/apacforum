import { speakerFormSchema } from '~~/shared/schemas/event'
import { createSpeaker } from '~~/server/services/speakers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const form = await parseBody(event, speakerFormSchema)
  return { id: await createSpeaker(form) }
})
