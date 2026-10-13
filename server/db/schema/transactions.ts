import { sql } from 'drizzle-orm'
import { bigint, char, index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import type { TransactionHistory, TransactionItems, TransactionPayment } from '../../../shared/schemas/transaction'
import { id, jsonb, timestamps } from '../columns'
import { users } from './auth'
import { paymentMethod, transactionStatus } from './enums'
import { events } from './events'
import { participants } from './participants'

/**
 * Every transaction. Plain columns only for what is searched, filtered, sorted or summed;
 * invoice lines, DOKU details and the status history live in jsonb.
 * FKs are `set null` plus snapshot columns, so a transaction survives deleting its participant or event.
 */
export const transactions = pgTable('transactions', {
  id: id(),
  /** `INV-APCR-26-01248` — also DOKU's `invoice_number`. */
  invoiceNo: varchar({ length: 32 }).notNull().unique(),
  userId: uuid().references(() => users.id, { onDelete: 'set null' }),
  participantId: uuid().references(() => participants.id, { onDelete: 'set null' }),
  eventId: uuid().references(() => events.id, { onDelete: 'set null' }),
  participantName: varchar({ length: 200 }).notNull(),
  participantEmail: varchar({ length: 320 }).notNull(),
  eventName: varchar({ length: 200 }).notNull(),
  ticketTypeName: varchar({ length: 120 }).notNull(),
  status: transactionStatus().notNull().default('pending'),
  method: paymentMethod(),
  total: bigint({ mode: 'number' }).notNull(),
  currency: char({ length: 3 }).notNull().default('IDR'),
  expiresAt: timestamp({ withTimezone: true }),
  paidAt: timestamp({ withTimezone: true }),
  items: jsonb<TransactionItems>().notNull(),
  payment: jsonb<TransactionPayment>().notNull().default({}),
  history: jsonb<TransactionHistory>().notNull().default([]),
  ...timestamps
}, t => [
  index().on(t.status, t.createdAt.desc()),
  index().on(t.eventId),
  index().on(t.userId),
  index().on(t.participantId),
  index('transactions_pending_expires_at').on(t.expiresAt).where(sql`${t.status} = 'pending'`),
  index('transactions_invoice_no_trgm').using('gin', sql`${t.invoiceNo} gin_trgm_ops`),
  index('transactions_participant_name_trgm').using('gin', sql`${t.participantName} gin_trgm_ops`)
])
