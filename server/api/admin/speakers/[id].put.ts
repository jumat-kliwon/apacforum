import { speakerFormSchema } from '~~/shared/schemas/event'
import { updateSpeaker } from '~~/server/services/speakers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(event)
  const form = await parseBody(event, speakerFormSchema)
  return { id: await updateSpeaker(id, form) }
})
