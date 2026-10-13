import type { H3Event } from 'h3'
import { auth } from './auth'

/** Requires an admin session; used by every `/api/admin/**` route. */
export async function requireAdmin(event: H3Event) {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Please sign in first' })
  }
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admins only' })
  }
  return session.user
}
