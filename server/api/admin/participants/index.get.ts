import { participantListQuery } from '~~/shared/schemas/participant'
import { listParticipants } from '~~/server/services/lists'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'registrations.manage')
  return listParticipants(parseQuery(event, participantListQuery))
})
