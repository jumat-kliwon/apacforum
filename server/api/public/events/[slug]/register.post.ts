import { registrationSchema } from '~~/shared/schemas/participant'
import { registerParticipant } from '~~/server/services/registration'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const body = await parseBody(event, registrationSchema)
  const { regNo } = await registerParticipant(slug, body)
  return { regNo }
})
