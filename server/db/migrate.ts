/**
 * Applies pending migrations. Runs locally (`bun run db:migrate`) and in the Vercel build,
 * on `DATABASE_URL`: the same database the app reads.
 */
import { SQL } from 'bun'
import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate } from 'drizzle-orm/bun-sql/migrator'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')

const client = new SQL(url, { max: 1 })
await migrate(drizzle({ client }), { migrationsFolder: new URL('./migrations', import.meta.url).pathname })
console.log('Migrations applied')
await client.close()
