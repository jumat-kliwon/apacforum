import { eq, inArray, sql } from 'drizzle-orm'
import { FOREIGN_CURRENCIES, type Currency, type ForeignCurrency } from '../../shared/utils/money'
import { db } from '../db'
import { currencyRates, events, users } from '../db/schema'
import type { Db } from './context'

/** Every foreign currency with its rate (null while not set), who set it, and how many events use it. */
export async function listRates() {
  const [rows, usage] = await Promise.all([
    db.select({ currency: currencyRates.currency, rateIdr: currencyRates.rateIdr, updatedAt: currencyRates.updatedAt, updatedBy: users.name })
      .from(currencyRates)
      .leftJoin(users, eq(users.id, currencyRates.updatedBy)),
    db.select({ currency: events.currency, n: sql<number>`count(*)::int` })
      .from(events)
      .where(inArray(events.currency, [...FOREIGN_CURRENCIES]))
      .groupBy(events.currency)
  ])
  return FOREIGN_CURRENCIES.map((currency) => {
    const r = rows.find(row => row.currency === currency)
    return {
      currency,
      rateIdr: r?.rateIdr ?? null,
      updatedAt: r?.updatedAt ?? null,
      updatedBy: r?.updatedBy ?? null,
      events: usage.find(u => u.currency === currency)?.n ?? 0
    }
  })
}

/** Sets a rate. It applies to invoices issued from now on; existing invoices keep the rate they copied. */
export async function setRate(currency: ForeignCurrency, rateIdr: string, actor: { id: string }) {
  await db.insert(currencyRates)
    .values({ currency, rateIdr, updatedBy: actor.id })
    .onConflictDoUpdate({ target: currencyRates.currency, set: { rateIdr, updatedBy: actor.id, updatedAt: new Date() } })
}

/** The current rate of a currency, or null while none is set. */
export async function getRate(currency: ForeignCurrency, d: Db = db) {
  const [row] = await d.select({ rateIdr: currencyRates.rateIdr }).from(currencyRates).where(eq(currencyRates.currency, currency))
  return row?.rateIdr ?? null
}

/** The rate an event in `currency` is invoiced at: null for IDR, 409 when a foreign currency has no rate yet. */
export async function requireRate(currency: Currency, d: Db = db) {
  if (currency === 'IDR') return null
  const rate = await getRate(currency, d)
  if (!rate) throw createError({ statusCode: 409, statusMessage: `No ${currency} exchange rate has been set yet` })
  return rate
}
