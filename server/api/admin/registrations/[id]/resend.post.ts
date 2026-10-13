import { resendStatusEmail } from '~~/server/services/registration'

/** Kirim ulang email sesuai status (termasuk e-tiket bila lunas). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return { template: await resendStatusEmail(parseId(event)) }
})
