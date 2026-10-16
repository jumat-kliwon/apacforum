import { speakerListQuery } from '~~/shared/schemas/event'
import { listSpeakers } from '~~/server/services/speakers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return listSpeakers(parseQuery(event, speakerListQuery))
})
