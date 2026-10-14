import type { H3Event } from 'h3'
import { waitUntil } from '@vercel/functions'

/**
 * Finishes work after the response is sent (emails, logging).
 * Nitro's Vercel preset does not hook `event.waitUntil` into the function lifetime,
 * so Vercel's own `waitUntil` keeps the function alive; elsewhere it is a no-op.
 */
export function runAfterResponse(event: H3Event, label: string, work: () => Promise<unknown>) {
  const promise = work().catch(err => console.error(`[background] ${label} failed`, err))
  event.waitUntil(promise)
  waitUntil(promise)
}
