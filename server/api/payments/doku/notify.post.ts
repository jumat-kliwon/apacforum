import { markPaid } from '~~/server/services/payment'
import { verifyNotification, type DokuNotification } from '~~/server/services/doku'

/**
 * Payment notification from DOKU. The signature is verified against the raw body.
 * Statuses other than SUCCESS are logged and ignored (expiry is handled by a scheduled task).
 */
export default defineEventHandler(async (event) => {
  const raw = (await readRawBody(event, 'utf8')) ?? ''
  if (!verifyNotification(event.headers, raw)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }
  let body: DokuNotification
  try {
    body = JSON.parse(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Body is not JSON' })
  }
  const status = body.transaction?.status?.toUpperCase()
  if (status !== 'SUCCESS') {
    console.info('[doku] notification ignored', body.order?.invoice_number, status)
    return { ok: true }
  }
  await markPaid(body)
  return { ok: true }
})
