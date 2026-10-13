/**
 * DOKU Checkout (hosted payment page) + HTTP notifications.
 * Docs: https://docs.doku.com/accept-payments/integration-tools/doku-checkout
 *
 * Flow: the server creates a payment with `POST /checkout/v1/payment`, sends the returned
 * `response.payment.url` to the participant, and DOKU calls the notification URL once paid.
 *
 * Request signature (DOKU non-SNAP): "HMACSHA256=" + base64(HMAC-SHA256(secretKey, component)) where component is
 *   Client-Id:<id>\nRequest-Id:<uuid>\nRequest-Timestamp:<ISO8601 UTC>\nRequest-Target:<path>\nDigest:<base64(sha256(body))>
 * Notifications are signed the same way with Request-Target = our notification path.
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

/** `2026-10-12T08:00:00Z` — UTC without milliseconds, as DOKU expects. */
const timestamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

export type CheckoutInput = {
  invoiceNo: string
  amount: number
  /** How long the checkout page stays payable, in minutes. */
  dueMinutes: number
  /** Where DOKU sends the payer after the checkout page. */
  callbackUrl: string
  /** Absolute URL of our notification endpoint (its path must match the one set in the DOKU Back Office). */
  notificationUrl: string
  customer: { id: string, name: string, email: string, phone?: string | null }
  lineItems: { name: string, price: number, quantity: number }[]
}

export type CheckoutResult = { url: string, tokenId: string | null, requestId: string, expiresAt: Date | null }

type CheckoutResponse = {
  message?: string[]
  response?: {
    payment?: { url?: string, token_id?: string, expired_date?: string }
  }
}

/** `yyyyMMddHHmmss` in WIB (DOKU's `expired_date`) → Date. */
function parseDokuDate(value: string | undefined) {
  if (!value || !/^\d{14}$/.test(value)) return null
  const v = value
  return new Date(`${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T${v.slice(8, 10)}:${v.slice(10, 12)}:${v.slice(12, 14)}+07:00`)
}

export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const cfg = config()
  if (!cfg) {
    // Development without credentials: a fake link so the rest of the flow can still be tried.
    console.warn(`[doku] DOKU_CLIENT_ID/DOKU_SECRET_KEY not set — simulating checkout for ${input.invoiceNo}`)
    return { url: `${input.callbackUrl}?simulated=1&invoice=${input.invoiceNo}`, tokenId: null, requestId: `sim-${randomUUID()}`, expiresAt: null }
  }

  const requestId = randomUUID()
  const ts = timestamp()
  const body = JSON.stringify({
    order: {
      amount: input.amount,
      invoice_number: input.invoiceNo,
      currency: 'IDR',
      callback_url: input.callbackUrl,
      callback_url_cancel: input.callbackUrl,
      line_items: input.lineItems.map(l => ({ name: l.name.slice(0, 255), price: l.price, quantity: l.quantity }))
    },
    payment: {
      payment_due_date: input.dueMinutes
    },
    customer: {
      id: input.customer.id,
      name: input.customer.name.slice(0, 255),
      email: input.customer.email,
      ...(input.customer.phone && { phone: input.customer.phone.replace(/[^\d+]/g, '') })
    },
    additional_info: {
      override_notification_url: input.notificationUrl
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
  const json = await res.json().catch(() => null) as CheckoutResponse | null
  const payment = json?.response?.payment
  if (!res.ok || !payment?.url) {
    console.error('[doku] checkout failed', res.status, json)
    throw createError({ statusCode: 502, statusMessage: 'Could not create the DOKU payment' })
  }
  return { url: payment.url, tokenId: payment.token_id ?? null, requestId, expiresAt: parseDokuDate(payment.expired_date) }
}

/** Verifies a DOKU notification. `rawBody` must be exactly what was received. */
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

/** Maps a DOKU channel to our method + bank. Example ids: VIRTUAL_ACCOUNT_BCA, QRIS, CREDIT_CARD, EMONEY_OVO. */
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
