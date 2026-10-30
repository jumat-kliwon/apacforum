import { sql } from 'drizzle-orm'
import { bigint, boolean, check, date, index, integer, pgTable, smallint, text, timestamp, unique, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../columns'
import { users } from './auth'
import { currency, eventStatus, partnerCategory, publishStatus, speakerCategory } from './enums'

export const events = pgTable('events', {
  id: id(),
  /** Prefix of REG/INV/e-ticket numbers, e.g. `APCR`. */
  code: varchar({ length: 8 }).notNull().unique(),
  slug: varchar({ length: 120 }).notNull().unique(),
  name: varchar({ length: 200 }).notNull(),
  tagline: varchar({ length: 255 }),
  description: text().notNull().default(''),
  startDate: date().notNull(),
  endDate: date().notNull(),
  registrationDeadline: timestamp({ withTimezone: true }).notNull(),
  venueName: varchar({ length: 200 }).notNull(),
  venueAddress: text(),
  city: varchar({ length: 120 }).notNull(),
  capacity: integer().notNull(),
  /** Object key in Cloudflare R2. */
  bannerKey: text(),
  status: eventStatus().notNull().default('draft'),
  registrationOpen: boolean().notNull().default(true),
  /** The event the website features; at most one row is true (see `events_single_default`). */
  isDefault: boolean().notNull().default(false),
  timezone: varchar({ length: 64 }).notNull().default('Asia/Jakarta'),
  /** Currency of every ticket price of the event; foreign ones are converted to IDR when invoicing (`currency_rates`). */
  currency: currency().notNull().default('IDR'),
  registrationSeq: integer().notNull().default(0),
  invoiceSeq: integer().notNull().default(0),
  createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
  publishedAt: timestamp({ withTimezone: true }),
  ...timestamps
}, t => [
  check('events_date_range', sql`${t.endDate} >= ${t.startDate}`),
  check('events_capacity_nonnegative', sql`${t.capacity} >= 0`),
  index().on(t.status, t.startDate),
  uniqueIndex('events_single_default').on(t.isDefault).where(sql`${t.isDefault}`)
])

export const agendaDays = pgTable('agenda_days', {
  id: id(),
  eventId: uuid().notNull().references(() => events.id, { onDelete: 'cascade' }),
  sortOrder: smallint().notNull(),
  label: varchar({ length: 80 }).notNull(),
  date: date().notNull(),
  theme: varchar({ length: 255 }).notNull(),
  body: text().notNull().default(''),
  ...timestamps
}, t => [
  unique().on(t.eventId, t.sortOrder)
])

export const speakers = pgTable('speakers', {
  id: id(),
  eventId: uuid().notNull().references(() => events.id, { onDelete: 'cascade' }),
  /** The "Session" column. */
  agendaDayId: uuid().references(() => agendaDays.id, { onDelete: 'set null' }),
  name: varchar({ length: 200 }).notNull(),
  /** "Position & institution". */
  title: varchar({ length: 255 }).notNull(),
  category: speakerCategory().notNull(),
  photoKey: text(),
  status: publishStatus().notNull().default('draft'),
  sortOrder: smallint().notNull().default(0),
  ...timestamps
}, t => [
  index().on(t.eventId, t.sortOrder)
])

export const partners = pgTable('partners', {
  id: id(),
  eventId: uuid().notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: varchar({ length: 200 }).notNull(),
  logoKey: text(),
  /** The logo links here on the website. */
  websiteUrl: varchar({ length: 500 }),
  category: partnerCategory().notNull(),
  /** Shown in the partners section of the home page. */
  showHome: boolean().notNull().default(false),
  sortOrder: smallint().notNull().default(0),
  ...timestamps
}, t => [
  index().on(t.eventId, t.category, t.sortOrder)
])

export const ticketTypes = pgTable('ticket_types', {
  id: id(),
  eventId: uuid().notNull().references(() => events.id, { onDelete: 'cascade' }),
  /** Part of the e-ticket code, e.g. `ID` → `APCR26-ID-0712`. */
  code: varchar({ length: 6 }).notNull(),
  name: varchar({ length: 120 }).notNull(),
  /** Minor units of the event's `currency`: whole rupiah for IDR, cents for USD and SGD. */
  price: bigint({ mode: 'number' }).notNull(),
  /** An early-bird ticket can only be bought up to `earlyBirdUntil`. */
  isEarlyBird: boolean().notNull().default(false),
  earlyBirdUntil: timestamp({ withTimezone: true }),
  paxPerTicket: smallint().notNull().default(1),
  quota: integer().notNull(),
  ticketSeq: integer().notNull().default(0),
  isOnSale: boolean().notNull().default(true),
  sortOrder: smallint().notNull().default(0),
  ...timestamps
}, t => [
  unique().on(t.eventId, t.code),
  check('ticket_types_price_nonnegative', sql`${t.price} >= 0`),
  check('ticket_types_early_bird_until', sql`${t.isEarlyBird} = (${t.earlyBirdUntil} is not null)`),
  check('ticket_types_quota_nonnegative', sql`${t.quota} >= 0`),
  check('ticket_types_pax_positive', sql`${t.paxPerTicket} >= 1`)
])
