/**
 * CMS access control. Every user has one role (`users.role` → `roles.key`); a role holds permissions.
 * Permissions are defined here and synced to the `permissions` table, so the code can check them by key;
 * which role holds which permission is edited in the CMS (Access → Roles).
 */
export const PERMISSIONS = {
  'dashboard.view': { group: 'Events', label: 'Event dashboard', description: 'Registration and revenue stats of each event' },
  'events.manage': { group: 'Events', label: 'Events & tickets', description: 'Create, edit, publish, archive and delete events and their ticket types' },
  'registrations.manage': { group: 'Events', label: 'Registrations', description: 'View participants; verify, reject, check in, email, edit and delete them' },
  'transactions.manage': { group: 'Finance', label: 'Transactions & refunds', description: 'View invoices and payments, and refund them' },
  'exports.manage': { group: 'Finance', label: 'CSV exports', description: 'Download participant and transaction lists' },
  'news.manage': { group: 'Content', label: 'News & Media', description: 'Write, publish and delete articles' },
  'email_templates.view': { group: 'Content', label: 'Email templates', description: 'Preview the emails sent to participants' },
  'access.manage': { group: 'Access', label: 'Users & roles', description: 'Create staff accounts, assign roles and edit role permissions' }
} as const satisfies Record<string, { group: string, label: string, description: string }>

export type Permission = keyof typeof PERMISSIONS
export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as Permission[]

/** Holds every permission and cannot be edited or deleted. */
export const SUPERADMIN_ROLE = 'superadmin'
/** Everyone who registered for an event; no CMS access, hidden from Access → Roles. */
export const PARTICIPANT_ROLE = 'participant'

export function isPermission(key: string): key is Permission {
  return Object.hasOwn(PERMISSIONS, key)
}

/** True when `granted` holds at least one of `needed`. */
export function can(granted: readonly string[] | undefined, needed: Permission | readonly Permission[]) {
  const list = typeof needed === 'string' ? [needed] : needed
  return !!granted && list.some(p => granted.includes(p))
}

/**
 * No escalation: a user may only hand out what it holds itself. Superadmins may assign any role;
 * nobody else may assign the superadmin role.
 */
export function canGrant(actor: { role: string, permissions: readonly string[] }, roleKey: string, rolePermissions: readonly string[]) {
  if (actor.role === SUPERADMIN_ROLE) return true
  if (roleKey === SUPERADMIN_ROLE) return false
  return rolePermissions.every(p => actor.permissions.includes(p))
}
