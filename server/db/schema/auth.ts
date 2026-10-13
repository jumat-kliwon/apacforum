import { sql } from 'drizzle-orm'
import { boolean, char, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { citext, id, timestamps } from '../columns'
import { tshirtSize } from './enums'

/**
 * Better Auth tables (plural names via the adapter's `usePlural: true`) plus admin plugin columns.
 * `users` holds both admins and participants, told apart by `role`.
 */
export const users = pgTable('users', {
  id: id(),
  name: varchar({ length: 200 }).notNull(),
  email: citext().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  // admin plugin
  role: varchar({ length: 20 }).notNull().default('participant'),
  banned: boolean().default(false),
  banReason: text(),
  banExpires: timestamp({ withTimezone: true }),
  // participant profile (Better Auth `additionalFields`, input: false)
  phone: varchar({ length: 32 }),
  organization: varchar({ length: 200 }),
  jobTitle: varchar({ length: 200 }),
  country: char({ length: 2 }),
  city: varchar({ length: 120 }),
  tshirtSize: tshirtSize(),
  mealPreference: varchar({ length: 60 }),
  referralSource: varchar({ length: 120 }),
  ...timestamps
}, t => [
  index().on(t.role),
  // "name, email or organization" search (ILIKE)
  index('users_name_trgm').using('gin', sql`${t.name} gin_trgm_ops`),
  index('users_email_trgm').using('gin', sql`(${t.email}::text) gin_trgm_ops`),
  index('users_organization_trgm').using('gin', sql`${t.organization} gin_trgm_ops`)
])

export const sessions = pgTable('sessions', {
  id: id(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  token: text().notNull().unique(),
  ipAddress: text(),
  userAgent: text(),
  userId: uuid().notNull().references(() => users.id, { onDelete: 'cascade' }),
  impersonatedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
  ...timestamps
}, t => [
  index().on(t.userId)
])

export const accounts = pgTable('accounts', {
  id: id(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: uuid().notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp({ withTimezone: true }),
  refreshTokenExpiresAt: timestamp({ withTimezone: true }),
  scope: text(),
  password: text(),
  ...timestamps
}, t => [
  index().on(t.userId)
])

export const verifications = pgTable('verifications', {
  id: id(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  ...timestamps
}, t => [
  index().on(t.identifier)
])
