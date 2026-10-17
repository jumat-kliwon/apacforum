import { SQL } from 'bun'
import { drizzle } from 'drizzle-orm/bun-sql'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

/**
 * On Vercel each function instance gets its own small pool, so keep it small: many instances share the database.
 */
export const client = new SQL(process.env.DATABASE_URL, {
  max: process.env.VERCEL ? 3 : 10,
  idleTimeout: 30
})

export const db = drizzle({ client, schema, casing: 'snake_case' })

export type Database = typeof db
export { schema }
