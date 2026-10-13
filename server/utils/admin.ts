import type { H3Event } from 'h3'
import { auth } from './auth'

/** Session admin wajib; dipakai di semua route `/api/admin/**`. */
export async function requireAdmin(event: H3Event) {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Silakan login dulu' })
  }
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Khusus admin' })
  }
  return session.user
}
