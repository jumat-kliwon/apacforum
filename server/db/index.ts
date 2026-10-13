import { SQL } from 'bun'
import { drizzle } from 'drizzle-orm/bun-sql'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

export const client = new SQL(process.env.DATABASE_URL)

export const db = drizzle({ client, schema, casing: 'snake_case' })

export type Database = typeof db
export { schema }
