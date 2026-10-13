# APCR CMS

Admin panel and public event pages for the ASEAN Public Communication & Reputation Forum.
Bun · Nuxt 4 · Nuxt UI · PostgreSQL · Drizzle · Better Auth · Zod · DOKU Checkout · Cloudflare R2.

Database design and flows: [`docs/01-database-plan.md`](docs/01-database-plan.md).

## Local setup

```bash
bun install
cp .env.example .env          # fill in DATABASE_URL, BETTER_AUTH_SECRET, SEED_ADMIN_*
bun run db:migrate            # creates the tables (and the citext + pg_trgm extensions)
bun run db:seed               # admin + sample data from the design (wipes events/participants/transactions!)
bun run dev                   # http://localhost:3000 — CMS at /admin, sign in at /login
```

Without `DOKU_*` the payment link is simulated, without `SMTP_URL` emails are only logged, and without `R2_*`
image uploads are disabled — every other flow still works.

## Scripts

| Script | What it does |
|---|---|
| `bun run dev` | Dev server (Bun runtime) |
| `bun run build` / `bun run preview` | Build with the Nitro `bun` preset / run the build |
| `bun run typecheck` | Type check (vue-tsc) |
| `bun run db:generate` | Create a migration from changes in `server/db/schema` |
| `bun run db:migrate` | Apply migrations (`drizzle-orm/bun-sql` migrator) |
| `bun run db:seed` | Refill development data |
| `bun run db:studio` | Drizzle Studio |

## Structure

| Path | What |
|---|---|
| `app/pages/admin/**` | CMS: dashboard, participants, transactions, events, email templates |
| `app/pages/events/**`, `app/pages/index.vue` | Public event pages and registration form |
| `app/assets/css/main.css`, `app/app.config.ts` | Core Design System tokens mapped onto Nuxt UI |
| `server/api/admin/**` | Admin API (every route calls `requireAdmin`) |
| `server/api/public/**` | Public event data and registration |
| `server/api/payments/doku/notify.post.ts` | DOKU payment notifications |
| `server/services/` | Registration, payment, events, DOKU, R2 and email logic |
| `server/tasks/` | Scheduled jobs: expire invoices, payment reminders, event emails |
| `shared/` | Zod schemas, labels and formatters used by both sides |

## Notes

- `jsonb` columns use the `jsonb<T>()` helper from `server/db/columns.ts`, **not** Drizzle's built-in `jsonb()`: with the Bun.SQL driver the built-in one stores values as JSON strings. Inside `sql` expressions use `jsonParam()`.
- TypeScript is pinned to 6.x because vue-tsc does not support TypeScript 7 yet.
- In environments without IPv6, `bun run dev` fails with "Unable to find a random port"; run `HOST=127.0.0.1 bun run dev`.
- DOKU: set the notification URL path (`/api/payments/doku/notify`) in the DOKU Back Office as well.
