# APCR CMS

Admin panel + halaman event publik APCR. Bun · Nuxt 4 · Nuxt UI · PostgreSQL · Drizzle · Better Auth · Zod.

Rencana database: [`docs/01-database-plan.md`](docs/01-database-plan.md).

## Setup lokal

```bash
bun install
cp .env.example .env          # isi DATABASE_URL, BETTER_AUTH_SECRET, SEED_ADMIN_*
bun run db:migrate            # buat tabel (termasuk extension citext & pg_trgm)
bun run db:seed               # admin + data contoh dari desain (menghapus data event/peserta/transaksi!)
bun run dev                   # http://localhost:3000
```

## Script

| Script | Fungsi |
|---|---|
| `bun run dev` | Dev server (runtime Bun) |
| `bun run build` / `bun run preview` | Build Nitro preset `bun` / jalankan hasil build |
| `bun run typecheck` | Cek tipe (vue-tsc) |
| `bun run db:generate` | Buat file migrasi dari perubahan `server/db/schema` |
| `bun run db:migrate` | Jalankan migrasi (migrator `drizzle-orm/bun-sql`) |
| `bun run db:seed` | Isi ulang data development |
| `bun run db:studio` | Drizzle Studio |

## Catatan

- Kolom `jsonb` memakai helper `jsonb<T>()` dari `server/db/columns.ts`, **bukan** `jsonb()` bawaan Drizzle: dengan driver Bun.SQL, versi bawaan menyimpan nilai sebagai string JSON.
- TypeScript dipin ke 6.x karena vue-tsc belum mendukung TypeScript 7.
- Di environment tanpa IPv6, `bun run dev` gagal dengan "Unable to find a random port"; jalankan `HOST=127.0.0.1 bun run dev`.
