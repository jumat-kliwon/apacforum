import { sql } from 'drizzle-orm'
import { customType, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * jsonb for the Bun.SQL driver. Drizzle's built-in `jsonb()` sends `JSON.stringify(value)` and Bun.SQL
 * encodes that string again, so it is stored as a JSON *string* instead of an object. Bun.SQL already
 * encodes objects and arrays itself, so values are passed through as they are.
 */
export const jsonb = <T>() => customType<{ data: T, driverData: T }>({
  dataType: () => 'jsonb',
  toDriver: value => value,
  fromDriver: value => (typeof value === 'string' ? JSON.parse(value) : value) as T
})()

/** Case-insensitive text (`citext` extension) — used for emails. */
export const citext = customType<{ data: string }>({
  dataType: () => 'citext'
})

/** UUID v7: time-ordered, so B-tree indexes stay compact. */
export function uuidv7(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  const ms = BigInt(Date.now())
  for (let i = 0; i < 6; i++) bytes[i] = Number((ms >> BigInt(8 * (5 - i))) & 0xffn)
  bytes[6] = (bytes[6]! & 0x0f) | 0x70
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export const id = () => uuid().primaryKey().$defaultFn(uuidv7)

export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
}

/**
 * A jsonb value inside an `sql` expression (e.g. `column || ...`). Sent as text and cast in Postgres;
 * without `::text`, Bun.SQL would encode the string as a JSON string.
 */
export const jsonParam = (value: unknown) => sql`(${JSON.stringify(value)}::text)::jsonb`
