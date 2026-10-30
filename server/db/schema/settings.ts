import { sql } from 'drizzle-orm'
import { check, numeric, pgTable, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from '../columns'
import { users } from './auth'
import { currency } from './enums'

/**
 * Exchange rates to rupiah, one per foreign currency, shared by every event.
 * A rate is read when an invoice is issued and copied into `transactions.items.fx`,
 * so changing it never touches existing invoices. Rows are only inserted or updated, never deleted.
 */
export const currencyRates = pgTable('currency_rates', {
  currency: currency().primaryKey(),
  /** Rupiah per 1 unit of `currency`, e.g. `16250.0000`. */
  rateIdr: numeric({ precision: 18, scale: 4 }).notNull(),
  updatedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
  ...timestamps
}, t => [
  check('currency_rates_positive', sql`${t.rateIdr} > 0`),
  check('currency_rates_foreign', sql`${t.currency} <> 'IDR'`)
])
