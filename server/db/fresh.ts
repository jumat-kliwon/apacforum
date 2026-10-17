/**
 * Drops every table, type and extension, plus drizzle's migration journal, so the next
 * `db:migrate` rebuilds the database from scratch (like Laravel's `migrate:fresh`).
 *
 *   bun run db:fresh                   # local database
 *   FORCE_FRESH=1 bun run db:fresh     # any other host — wipes ALL data
 */
import { SQL } from 'bun'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')

const host = new URL(url).hostname
const isLocal = ['localhost', '127.0.0.1', '::1'].includes(host)
if (!isLocal && process.env.FORCE_FRESH !== '1') {
  throw new Error(`Refusing to wipe the database on ${host} (set FORCE_FRESH=1 to override)`)
}

const client = new SQL(url, { max: 1 })
await client.begin(async (tx) => {
  // the extensions (citext, pg_trgm) live in public, so CASCADE drops them too; 0000_extensions recreates them
  await tx`DROP SCHEMA IF EXISTS drizzle CASCADE`
  await tx`DROP SCHEMA IF EXISTS public CASCADE`
  await tx`CREATE SCHEMA public`
  await tx`GRANT ALL ON SCHEMA public TO public`
})
// Other sessions (a connection pooler's, the running app) keep prepared statements bound to the
// old type OIDs (citext, enums) and fail with "cache lookup failed for type …" — close them.
const [{ count }] = await client`
  SELECT count(pg_terminate_backend(pid))::int AS count FROM pg_stat_activity
  WHERE datname = current_database() AND pid <> pg_backend_pid() AND usename = current_user`
console.log(`Database on ${host} wiped (${count} other connections closed)`)
await client.close()
