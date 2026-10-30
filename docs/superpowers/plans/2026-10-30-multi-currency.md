# Multi-currency (USD & SGD) — Plan Eksekusi

**Goal:** Ticket type bisa diberi harga dalam IDR, USD, atau SGD. Admin mengatur kurs USD→IDR dan SGD→IDR di satu halaman pengaturan global. Saat invoice dibuat, harga dikonversi ke rupiah dengan kurs saat itu. Kurs dan jumlah rupiahnya dikunci di transaksi. DOKU tetap hanya menerima IDR.

**Keputusan (sudah disetujui):**

| Topik | Keputusan |
|---|---|
| Level currency | Per ticket type |
| Lokasi kurs | Global, satu untuk semua event |
| Kurs berubah | Invoice yang sudah ada tidak berubah. Kurs dikunci saat invoice dibuat |
| Desimal | USD/SGD boleh 2 desimal, disimpan sebagai minor unit (sen) |

## Prinsip desain

1. **`transactions.total` tetap dalam rupiah**, yaitu jumlah yang ditagih ke DOKU. Karena itu `markPaid` (cek nominal), revenue dashboard, `users/[id]` totalPaid, refund, dan `sum(total)` **tidak perlu diubah**. Risiko regresi di alur uang jadi kecil.
2. **`ticket_types.price` disimpan dalam minor unit sesuai currency tiketnya**: IDR = rupiah (eksponen 0), USD/SGD = sen (eksponen 2). Baris yang sudah ada otomatis valid sebagai IDR, jadi tidak perlu migrasi data.
3. Harga asli dan kurs yang dipakai disimpan sebagai **snapshot di `transactions.items.fx`** (jsonb). Kolom ini hanya untuk ditampilkan, tidak dipakai untuk filter atau sum. Ini sesuai konvensi di `server/db/schema/transactions.ts`.
4. **Pembulatan:** `idr = ceil(priceMinor × rate / 10^exponent)`, dibulatkan ke atas ke rupiah penuh. Hitungannya pakai integer/BigInt, bukan float.
5. Kurs belum diisi → tiket USD/SGD **tidak bisa dibeli** (error 409 yang jelas). Tidak ada fallback diam-diam.

## Perubahan data (migration `0011_multi_currency.sql`)

```ts
// server/db/schema/enums.ts
export const currency = pgEnum('currency', ['IDR', 'USD', 'SGD'])

// server/db/schema/events.ts — ticketTypes
currency: currency().notNull().default('IDR'),
// price: arti berubah jadi "minor unit dari `currency`"; check >= 0 tetap

// server/db/schema/settings.ts (baru)
export const currencyRates = pgTable('currency_rates', {
  currency: currency().primaryKey(),             // 'USD' | 'SGD' (IDR tidak disimpan)
  rateIdr: numeric({ precision: 18, scale: 4 }).notNull(), // Rp per 1 unit, mis. 16250.0000
  updatedBy: uuid().references(() => users.id, { onDelete: 'set null' }),
  ...timestamps
}, t => [check('currency_rates_positive', sql`${t.rateIdr} > 0`),
         check('currency_rates_not_idr', sql`${t.currency} <> 'IDR'`)])
```

`transactions` **tidak** mendapat kolom baru. `currency` tetap `'IDR'`. `TransactionItems` (zod, `shared/schemas/transaction.ts`) mendapat field opsional:

```ts
fx: z.object({
  currency: z.enum(['USD', 'SGD']),
  unitPrice: z.number().int(),   // minor unit, mis. 14950
  total: z.number().int(),       // minor unit
  rateIdr: z.string(),           // "16250.0000", string agar presisi tetap
  rateAt: z.iso.datetime({ offset: true })
}).optional()
```

Transaksi IDR tidak memiliki `fx`, jadi transaksi lama tetap valid.

## Tasks

### Task 1 — Helper uang murni + unit test (`shared/utils/money.ts`)
- `CURRENCIES = ['IDR','USD','SGD']`, `EXPONENT = { IDR: 0, USD: 2, SGD: 2 }`.
- `toMinor(major: string | number, cur)`: parsing berbasis string supaya `0.29 → 29` dan `149.5 → 14950` tidak terkena error float. Tolak lebih dari 2 desimal.
- `toMajor(minor, cur)`.
- `convertToIdr(minor, cur, rateIdr: string)`: BigInt dan ceil. Untuk IDR mengembalikan nilai apa adanya.
- `formatMoney(minor, cur)`: `Rp 2,500,000` / `US$ 149.50` / `S$ 200.00`. `formatRupiah` tetap ada (dipakai untuk total IDR).
- `tests/unit/money.test.ts`: kasus pembulatan, harga 0, nilai besar, input tidak valid, IDR passthrough.

### Task 2 — Schema + migration
- Enum `currency`, kolom `ticket_types.currency`, tabel `currency_rates`, export di `schema/index.ts` dan `relations.ts`.
- `bun run db:generate` (drizzle-kit), lalu cek SQL yang dihasilkan: tidak boleh ada drop atau rewrite.
- `seed.ts`: tambah kurs contoh untuk dev dan satu ticket type USD.

### Task 3 — Permission + API kurs global
- `shared/utils/access.ts`: permission baru `'settings.manage'` (group `Finance`, label "Currency rates"). Superadmin otomatis memilikinya lewat sync yang sudah ada.
- `server/services/currency.ts`: `getRates()`, `setRate(cur, rate, actor)`, `requireRate(cur)` (409 "No exchange rate set for USD" jika belum ada).
- `GET /api/admin/settings/currency-rates` dan `PUT /api/admin/settings/currency-rates` (zod: rate > 0, maks 4 desimal). Keduanya diawali `requireAdmin` + `settings.manage`.
- `GET /api/public/currency-rates` (read-only) untuk menampilkan estimasi rupiah di halaman publik.

### Task 4 — Halaman admin pengaturan kurs
- `app/pages/admin/settings/currency.vue`, menu global "Currency rates" di `app/layouts/admin.vue` (grup yang sama dengan Email templates, digate `settings.manage`).
- Isinya form USD dan SGD (`Rp per 1 USD`), "Last updated by X at Y", dan teks bantuan: *"Changes apply to new invoices only. Unpaid invoices keep the rate they were issued with."*

### Task 5 — Ticket type: pilih currency
- `shared/schemas/event.ts`: ticket schema mendapat `currency`. Field `price` di form diterima sebagai angka mayor (maks 2 desimal untuk USD/SGD, bulat untuk IDR), lalu di-transform ke minor unit via `toMinor`.
- `app/components/admin/TicketForm.vue`: select currency, prefix input mengikuti currency, help text "≈ Rp X at today's rate" atau peringatan jika kurs belum diatur. "per person" memakai `formatMoney`.
- `server/api/admin/tickets/*`: simpan/kembalikan `currency`. Sort `price` diubah jadi `(currency, price)` supaya mata uang tidak tercampur.
- Ticket list (`tickets/index.vue`, tab tiket di `settings/index.vue`): pakai `formatMoney`.

### Task 6 — Konversi saat invoice dibuat (inti)
- `server/services/payment.ts` → `createInvoice`:
  - IDR: tidak ada perubahan perilaku.
  - USD/SGD: `rate = requireRate(cur)` (dibaca di dalam `tx` yang sama), `totalIdr = convertToIdr(price, cur, rate)`, lalu `items.lines[].unitPrice/subtotal` dalam IDR, `items.fx = {...}`, dan `total = totalIdr`.
  - Harga 0 tetap gratis di currency apa pun.
- `ensureCheckout` / `doku.ts`: **tidak berubah** (`currency: 'IDR'`, amount = `total`, line_items IDR yang jumlahnya sama dengan amount).
- Validasi di endpoint registrasi publik (`register.post.ts` / `registration.ts`): tolak lebih awal jika tiket USD/SGD dan kurs belum diatur, supaya peserta tidak tertahan di status "pending tanpa invoice".
- Catatan: untuk alur yang melalui verifikasi admin, kurs diambil **saat admin memverifikasi** (saat invoice dibuat), bukan saat peserta mendaftar. Ini sesuai keputusan "kunci saat invoice dibuat".

### Task 7 — Tampilan publik
- `events/[slug]/index.vue` dan `register.vue`: harga ditampilkan dengan currency aslinya, ditambah `≈ Rp X` untuk USD/SGD, ditambah catatan *"Charged in IDR. The final rupiah amount is fixed when your invoice is issued."*
- `payment/finish.vue`: jika ada `fx`, tampilkan total IDR + harga asli.

### Task 8 — Admin transaksi, email, export
- `transactions/index.vue` dan `[id].vue`, `registrations/[userId].vue`: total tetap IDR. Jika ada `fx`, tambahkan baris "US$ 149.50 @ Rp 16,250.0000".
- `server/services/context.ts` + `mail/templates.ts`: email invoice/paid menampilkan harga asli + kurs + total IDR. `ticketPrice` memakai `formatMoney(price, currency)`. Preview di `email-templates/[key].get.ts` mendapat contoh USD.
- `exports/transactions.get.ts`: kolom baru `Original currency`, `Original amount`, `FX rate (IDR)`.
- Refund: tidak berubah. `refundAmount` = total IDR yang dibayar, dan email refund menampilkan IDR.

### Task 9 — Verifikasi
- `bun run typecheck`, `bun run test`.
- Manual (mode DOKU simulated, tanpa kredensial):
  1. Atur kurs USD 16250, buat tiket USD 149.50, lalu daftar. Invoice harus Rp 2,429,375 dan payload DOKU harus `currency: IDR, amount: 2429375`, dengan jumlah line items sama dengan amount.
  2. Ubah kurs. Invoice lama tetap, invoice baru memakai kurs baru.
  3. Hapus/kosongkan kurs SGD. Registrasi tiket SGD harus ditolak dengan pesan jelas.
  4. Kirim notifikasi DOKU (signature valid) dengan amount IDR. `markPaid` harus sukses. Amount yang berbeda harus ditolak.
  5. Tiket IDR yang sudah ada tidak berubah tampilan maupun perilakunya.

## Urutan & dependensi

```
T1 money utils ─┬─> T2 schema ─┬─> T3 API kurs ─> T4 halaman kurs
                │              ├─> T5 ticket currency ─> T7 publik
                │              └─> T6 invoice (butuh T3 service) ─> T8 transaksi/email/export
                └──────────────────────────────────────────────────> T9 verifikasi
```

Estimasi: 1 PR. Migration-nya additive saja (kolom dengan default + tabel baru), jadi aman untuk rollback kode tanpa rollback DB.

## Risiko & hal yang perlu dicek

- **Pembulatan ke atas** membuat peserta membayar paling banyak Rp 1 lebih mahal. Jika ingin dibulatkan ke Rp 100 / Rp 1.000 terdekat, cukup ubah satu fungsi di `convertToIdr`.
- **Kurs tidak otomatis**: kurs diisi manual oleh admin. Fetch kurs otomatis dari API pihak ketiga bisa jadi fitur lanjutan.
- **Riwayat kurs**: plan ini hanya menyimpan nilai terakhir + `updatedBy`. Setiap transaksi sudah menyimpan snapshot kurs, jadi audit per transaksi tetap ada. Jika butuh log perubahan kurs, tambahkan tabel `currency_rate_history`.
- **Revenue dashboard** tetap dalam IDR (uang yang benar-benar diterima). Breakdown per currency asli tidak termasuk di scope ini.
