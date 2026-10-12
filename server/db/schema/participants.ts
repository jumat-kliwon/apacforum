import { sql } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { id, jsonb, timestamps } from '../columns'
import { users } from './auth'
import { paymentStatus, registrationStatus } from './enums'
import { events, ticketTypes } from './events'

/** Satu baris = satu user ikut satu event. Data diri ada di `users`. */
export const participants = pgTable('participants', {
  id: id(),
  /** `REG-APCR-26-01248` */
  regNo: varchar({ length: 32 }).notNull().unique(),
  userId: uuid().notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventId: uuid().notNull().references(() => events.id, { onDelete: 'cascade' }),
  ticketTypeId: uuid().notNull().references(() => ticketTypes.id, { onDelete: 'restrict' }),
  /** Jawaban form tambahan khusus event ini. */
  extra: jsonb<Record<string, unknown>>().notNull().default({}),
  status: registrationStatus().notNull().default('pending_verification'),
  paymentStatus: paymentStatus().notNull().default('none'),
  rejectionReason: text(),
  verifiedAt: timestamp({ withTimezone: true }),
  verifiedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
  rejectedAt: timestamp({ withTimezone: true }),
  cancelledAt: timestamp({ withTimezone: true }),
  /** `APCR26-ID-0712`, diisi saat lunas. */
  ticketCode: varchar({ length: 32 }).unique(),
  ticketIssuedAt: timestamp({ withTimezone: true }),
  checkedInAt: timestamp({ withTimezone: true }),
  ...timestamps
}, t => [
  // satu pendaftaran aktif per user per event; boleh daftar ulang setelah ditolak/batal
  uniqueIndex('participants_active_user_event')
    .on(t.eventId, t.userId)
    .where(sql`${t.status} not in ('rejected', 'cancelled')`),
  index().on(t.eventId, t.status),
  index().on(t.eventId, t.paymentStatus),
  index().on(t.createdAt.desc()),
  index().on(t.userId)
])
