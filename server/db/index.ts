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
  idleTimeout: 30,
  // No named prepared statements: a long-lived or pooled connection keeps them across requests, and after a
  // migration changes a column type Postgres rejects them ("cached plan must not change result type").
  prepare: false
})

export const db = drizzle({ client, schema, casing: 'snake_case' })

export type Database = typeof db
export { schema }
