import { registrationSchema } from '~~/shared/schemas/participant'
import { registerParticipant } from '~~/server/services/registration'

export default defineEventHandler(async (event) => {
  // shared office networks register several colleagues, so the limit stays generous
  rateLimit(event, 'register', { limit: 10, windowMs: 10 * 60_000 })
  const slug = getRouterParam(event, 'slug') ?? ''
  const body = await parseBody(event, registrationSchema)
  const { regNo, invoiceNo, paymentUrl, free, notify } = await registerParticipant(slug, body)
  // the registrant goes straight to DOKU; the email does not hold up the redirect
  runAfterResponse(event, 'registration email', notify)
  return { regNo, invoiceNo, paymentUrl, free }
})
