import { markPaid } from '~~/server/services/payment'
import { verifyNotification, type DokuNotification } from '~~/server/services/doku'

/**
 * Notifikasi pembayaran dari DOKU. Signature diverifikasi dari body mentah.
 * Status selain SUCCESS dicatat dan diabaikan (kedaluwarsa ditangani task terjadwal).
 */
export default defineEventHandler(async (event) => {
  const raw = (await readRawBody(event, 'utf8')) ?? ''
  if (!verifyNotification(event.headers, raw)) {
    throw createError({ statusCode: 401, statusMessage: 'Signature tidak valid' })
  }
  let body: DokuNotification
  try {
    body = JSON.parse(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Body bukan JSON' })
  }
  const status = body.transaction?.status?.toUpperCase()
  if (status !== 'SUCCESS') {
    console.info('[doku] notifikasi diabaikan', body.order?.invoice_number, status)
    return { ok: true }
  }
  await markPaid(body)
  return { ok: true }
})
