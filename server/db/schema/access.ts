import { boolean, pgTable, primaryKey, uuid, varchar } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../columns'

/** CMS roles. `users.role` holds a role key; `superadmin` and `participant` are system roles. */
export const roles = pgTable('roles', {
  id: id(),
  /** Stored in `users.role`; set once when the role is created. */
  key: varchar({ length: 40 }).notNull().unique(),
  name: varchar({ length: 80 }).notNull(),
  description: varchar({ length: 255 }),
  /** System roles cannot be renamed, edited or deleted. */
  isSystem: boolean().notNull().default(false),
  ...timestamps
})

/** Mirror of `PERMISSIONS` in shared/utils/access.ts, synced by `db:bootstrap` on every deploy. */
export const permissions = pgTable('permissions', {
  key: varchar({ length: 60 }).primaryKey(),
  group: varchar({ length: 40 }).notNull(),
  label: varchar({ length: 80 }).notNull(),
  description: varchar({ length: 255 })
})

export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid().notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionKey: varchar({ length: 60 }).notNull().references(() => permissions.key, { onDelete: 'cascade', onUpdate: 'cascade' })
}, t => [
  primaryKey({ columns: [t.roleId, t.permissionKey] })
])
