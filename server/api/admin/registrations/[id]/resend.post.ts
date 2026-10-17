import { resendStatusEmail } from '~~/server/services/registration'

/** Resends the email for the current status (including the e-ticket once paid). */
export default defineEventHandler(async (event) => {
  await requireStaff(event)
  return { template: await resendStatusEmail(parseId(event)) }
})
