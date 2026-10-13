import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

/**
 * The ticket scanner is a public page: whoever holds an event's scanner link can check its
 * tickets in without signing in. The link carries this key, an HMAC of the event id, so it
 * needs no storage; changing BETTER_AUTH_SECRET invalidates every link.
 */
export function scannerKey(eventId: string) {
  return createHmac('sha256', process.env.BETTER_AUTH_SECRET ?? '')
    .update(`ticket-scanner:${eventId}`)
    .digest('base64url')
    .slice(0, 32)
}

export const scannerPath = (eventId: string) => `/scan/${eventId}?key=${scannerKey(eventId)}`

/** Event id from the route, once the scanner key that came with the request matches it. */
export function requireScannerKey(event: H3Event, key: unknown) {
  const eventId = parseId(event)
  const expected = Buffer.from(scannerKey(eventId))
  const given = Buffer.from(typeof key === 'string' ? key : '')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw createError({ statusCode: 403, statusMessage: 'This scanner link is not valid. Ask the organiser for a new one.' })
  }
  return eventId
}
