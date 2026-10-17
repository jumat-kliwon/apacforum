/**
 * CMS roles. `superadmin` sees everything; `admin` manages news and events
 * (event settings, tickets, registrations) but not transactions, refunds, exports,
 * the event dashboard (it shows revenue) or email templates.
 */
export const STAFF_ROLES = ['superadmin', 'admin'] as const
export type StaffRole = typeof STAFF_ROLES[number]

/** What a CMS page or admin API route needs: `staff` = either role, `superadmin` = superadmin only. */
export type Access = 'staff' | 'superadmin'

export function isStaff(role: unknown): role is StaffRole {
  return STAFF_ROLES.includes(role as StaffRole)
}

export function hasAccess(role: unknown, access: Access) {
  return access === 'staff' ? isStaff(role) : role === 'superadmin'
}

