import { sql } from 'drizzle-orm'
import { customType, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * jsonb untuk driver Bun.SQL. `jsonb()` bawaan Drizzle mengirim `JSON.stringify(value)`, lalu Bun.SQL
 * meng-encode string itu lagi → tersimpan sebagai *string* JSON, bukan objek. Bun.SQL sudah meng-encode
 * objek/array sendiri, jadi nilai diteruskan apa adanya.
 */
export const jsonb = <T>() => customType<{ data: T, driverData: T }>({
  dataType: () => 'jsonb',
  toDriver: value => value,
  fromDriver: value => (typeof value === 'string' ? JSON.parse(value) : value) as T
})()

/** Teks case-insensitive (extension `citext`) — dipakai untuk email. */
export const citext = customType<{ data: string }>({
  dataType: () => 'citext'
})

/** UUID v7: urut waktu, jadi index B-tree tetap rapat. */
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
 * Nilai jsonb di dalam ekspresi `sql` (mis. `kolom || ...`). Dikirim sebagai teks lalu di-cast di Postgres;
 * tanpa `::text`, Bun.SQL meng-encode string itu sebagai string JSON.
 */
export const jsonParam = (value: unknown) => sql`(${JSON.stringify(value)}::text)::jsonb`
