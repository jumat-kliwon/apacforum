import { participantListQuery } from '~~/shared/schemas/participant'
import { listParticipants } from '~~/server/services/lists'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return listParticipants(parseQuery(event, participantListQuery))
})
