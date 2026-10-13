import { migrate } from 'drizzle-orm/bun-sql/migrator'
import { client, db } from './index'

await migrate(db, { migrationsFolder: new URL('./migrations', import.meta.url).pathname })
console.log('Migrations applied')
await client.close()
