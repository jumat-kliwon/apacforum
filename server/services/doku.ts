/**
 * DOKU Checkout + notifikasi pembayaran.
 * Skema signature (Non-SNAP): "HMACSHA256=" + base64(HMAC-SHA256(secret, komponen)) dengan komponen
 *   Client-Id:..\nRequest-Id:..\nRequest-Timestamp:..\nRequest-Target:..\nDigest:base64(sha256(body))
 * Rujukan: https://developers.doku.com (Checkout & Notification). Cocokkan lagi dengan dokumentasi
 * akun DOKU sebelum produksi.
 */
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

const CHECKOUT_PATH = '/checkout/v1/payment'
export const NOTIFY_PATH = '/api/payments/doku/notify'

function config() {
  const clientId = process.env.DOKU_CLIENT_ID
  const secretKey = process.env.DOKU_SECRET_KEY
  const baseUrl = (process.env.DOKU_BASE_URL ?? 'https://api-sandbox.doku.com').replace(/\/$/, '')
  if (!clientId || !secretKey) return null
  return { clientId, secretKey, baseUrl }
}

export const isDokuConfigured = () => config() !== null

const digest = (body: string) => createHash('sha256').update(body, 'utf8').digest('base64')

function signature(secretKey: string, parts: { clientId: string, requestId: string, timestamp: string, target: string, body: string }) {
  const component = [
    `Client-Id:${parts.clientId}`,
    `Request-Id:${parts.requestId}`,
    `Request-Timestamp:${parts.timestamp}`,
    `Request-Target:${parts.target}`,
    `Digest:${digest(parts.body)}`
  ].join('\n')
  return `HMACSHA256=${createHmac('sha256', secretKey).update(component).digest('base64')}`
}

/** `2026-10-12T08:00:00Z` (tanpa milidetik, sesuai format DOKU) */
const timestamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

export type CheckoutInput = {
  invoiceNo: string
  amount: number
  dueMinutes: number
  callbackUrl: string
  customer: { name: string, email: string, phone?: string | null }
  lineItems: { name: string, price: number, quantity: number }[]
}

export type CheckoutResult = { url: string, requestId: string, expiresAt: Date | null }

export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const cfg = config()
  if (!cfg) {
    // dev tanpa kredensial: link palsu supaya alur lain tetap bisa dicoba
    console.warn(`[doku] DOKU_CLIENT_ID/DOKU_SECRET_KEY kosong — checkout ${input.invoiceNo} disimulasikan`)
    return { url: `${input.callbackUrl}?simulated=1&invoice=${input.invoiceNo}`, requestId: `sim-${randomUUID()}`, expiresAt: null }
  }

  const requestId = randomUUID()
  const ts = timestamp()
  const body = JSON.stringify({
    order: {
      invoice_number: input.invoiceNo,
      amount: input.amount,
      currency: 'IDR',
      callback_url: input.callbackUrl,
      line_items: input.lineItems.map(l => ({ name: l.name.slice(0, 255), price: l.price, quantity: l.quantity }))
    },
    payment: { payment_due_date: input.dueMinutes },
    customer: {
      name: input.customer.name.slice(0, 255),
      email: input.customer.email,
      ...(input.customer.phone && { phone: input.customer.phone.replace(/[^\d+]/g, '') })
    }
  })

  const res = await fetch(`${cfg.baseUrl}${CHECKOUT_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': cfg.clientId,
      'Request-Id': requestId,
      'Request-Timestamp': ts,
      'Signature': signature(cfg.secretKey, { clientId: cfg.clientId, requestId, timestamp: ts, target: CHECKOUT_PATH, body })
    },
    body
  })
  const json = await res.json().catch(() => null) as { response?: { payment?: { url?: string, expired_date?: string } }, message?: string[] } | null
  const url = json?.response?.payment?.url
  if (!res.ok || !url) {
    console.error('[doku] checkout gagal', res.status, json)
    throw createError({ statusCode: 502, statusMessage: 'Gagal membuat pembayaran di DOKU' })
  }
  // expired_date DOKU: "yyyyMMddHHmmss" (WIB)
  const ed = json.response?.payment?.expired_date
  const expiresAt = ed && /^\d{14}$/.test(ed)
    ? new Date(`${ed.slice(0, 4)}-${ed.slice(4, 6)}-${ed.slice(6, 8)}T${ed.slice(8, 10)}:${ed.slice(10, 12)}:${ed.slice(12, 14)}+07:00`)
    : null
  return { url, requestId, expiresAt }
}

/** Cek signature notifikasi dari DOKU. `rawBody` harus persis seperti diterima. */
export function verifyNotification(headers: Headers, rawBody: string) {
  const cfg = config()
  if (!cfg) return false
  const clientId = headers.get('client-id') ?? ''
  const requestId = headers.get('request-id') ?? ''
  const ts = headers.get('request-timestamp') ?? ''
  const received = headers.get('signature') ?? ''
  if (clientId !== cfg.clientId || !requestId || !ts || !received) return false
  const expected = signature(cfg.secretKey, { clientId, requestId, timestamp: ts, target: NOTIFY_PATH, body: rawBody })
  const a = Buffer.from(expected)
  const b = Buffer.from(received)
  return a.length === b.length && timingSafeEqual(a, b)
}

export type DokuNotification = {
  order?: { invoice_number?: string, amount?: number | string }
  transaction?: { status?: string, date?: string, original_request_id?: string }
  channel?: { id?: string }
  service?: { id?: string }
  acquirer?: { id?: string }
  virtual_account_info?: { virtual_account_number?: string }
}

/** Petakan kanal DOKU → metode + bank. Contoh id: VIRTUAL_ACCOUNT_BCA, QRIS, CREDIT_CARD, EMONEY_OVO. */
export function mapChannel(n: DokuNotification): { method: 'virtual_account' | 'qris' | 'credit_card' | 'bank_transfer' | 'e_wallet' | null, channel?: string } {
  const id = (n.channel?.id ?? n.service?.id ?? '').toUpperCase()
  if (id.startsWith('VIRTUAL_ACCOUNT')) {
    const bank = id.replace(/^VIRTUAL_ACCOUNT_?/, '').replace(/^BANK_/, '').split('_')[0]
    return { method: 'virtual_account', channel: bank || n.acquirer?.id }
  }
  if (id.includes('QRIS')) return { method: 'qris' }
  if (id.includes('CREDIT_CARD')) return { method: 'credit_card', channel: n.acquirer?.id }
  if (id.startsWith('EMONEY') || id.includes('WALLET')) return { method: 'e_wallet', channel: id.replace(/^EMONEY_/, '') }
  if (id.includes('TRANSFER') || id.startsWith('DIRECT_DEBIT')) return { method: 'bank_transfer', channel: n.acquirer?.id }
  return { method: null }
}
