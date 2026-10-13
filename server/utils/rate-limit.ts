import type { H3Event } from 'h3'

/**
 * Fixed-window limit per client IP, kept in memory. Each server instance counts on its own
 * (Vercel Fluid Compute reuses instances), so this slows scripted abuse down but is no hard cap;
 * pair it with a Vercel Firewall rate-limit rule for that.
 */
const windows = new Map<string, { count: number, resetAt: number }>()

export function rateLimit(event: H3Event, name: string, { limit, windowMs }: { limit: number, windowMs: number }) {
  const now = Date.now()
  if (windows.size > 10_000) {
    for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k)
  }
  const key = `${name}:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`
  let w = windows.get(key)
  if (!w || w.resetAt <= now) {
    w = { count: 0, resetAt: now + windowMs }
    windows.set(key, w)
  }
  w.count++
  if (w.count > limit) {
    setHeader(event, 'Retry-After', Math.ceil((w.resetAt - now) / 1000))
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Please wait a few minutes and try again.' })
  }
}
