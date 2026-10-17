import type { H3Event } from 'h3'
import { auth } from './auth'

/**
 * Requires a CMS session with the given access; every `/api/admin/**` route calls one of the helpers below.
 * Routes default to `requireSuperadmin`; only news and event management opt in to `requireStaff`.
 */
async function requireAccess(event: H3Event, access: Access) {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Please sign in first' })
  }
  if (!hasAccess(session.user.role, access)) {
    throw createError({ statusCode: 403, statusMessage: isStaff(session.user.role) ? 'Superadmins only' : 'Admins only' })
  }
  return session.user
}

/** Superadmin or admin: news, events, tickets, registrations. */
export const requireStaff = (event: H3Event) => requireAccess(event, 'staff')

/** Superadmin only: dashboard, transactions, refunds, exports, email templates. */
export const requireSuperadmin = (event: H3Event) => requireAccess(event, 'superadmin')
