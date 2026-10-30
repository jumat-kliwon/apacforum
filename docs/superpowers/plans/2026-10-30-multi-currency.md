# Multi-currency (USD & SGD) — Plan Eksekusi

**Goal:** Setiap event memakai satu mata uang: IDR, USD, atau SGD. Mata uang dan kursnya ke rupiah diatur di Event settings. Saat invoice dibuat, harga dikonversi ke rupiah dengan kurs event saat itu, lalu kurs dan jumlah rupiahnya dikunci di transaksi. DOKU tetap hanya menerima IDR.

**Keputusan:**

| Topik | Keputusan |
|---|---|
| Level currency | **Per event**: semua ticket type dalam satu event memakai mata uang yang sama |
| Lokasi kurs | **Per event**, di Event settings, bersama pilihan mata uang |
| Kurs berubah | Hanya berlaku untuk invoice baru. Invoice yang sudah ada mengunci kursnya saat dibuat |
| Desimal | USD/SGD boleh 2 desimal, disimpan sebagai minor unit (sen) |

## Prinsip desain

1. **`transactions.total` tetap rupiah**, yaitu jumlah yang ditagih ke DOKU. `markPaid` (cek nominal), revenue dashboard, `users/[id]` totalPaid, refund, `sum(total)`, dan `doku.ts` **tidak berubah**.
2. **`ticket_types.price` disimpan dalam minor unit mata uang event-nya**. Untuk IDR satuannya rupiah, untuk USD/SGD satuannya sen. Event dan tiket yang sudah ada otomatis IDR, jadi tidak perlu migrasi data.
3. Harga asli dan kurs disimpan sebagai **snapshot di `transactions.items.fx`** (jsonb). Snapshot ini hanya untuk tampilan, tidak dipakai untuk filter atau sum.
4. **Pembulatan:** `idr = ceil(priceMinor × rate / 10^exponent)`, dihitung dengan BigInt (bukan float), dibulatkan ke atas ke rupiah penuh.
5. **Event non-IDR wajib punya kurs.** Aturan ini dijaga dengan check constraint di DB, jadi tidak ada kondisi "kurs belum diisi" saat checkout.
6. **Mata uang event dikunci begitu ada tiket berbayar.** Kalau mata uang diganti, harga yang tersimpan akan dibaca dalam satuan baru, misalnya `2500000` rupiah terbaca US$ 25,000.00. Karena itu `PUT /events/[id]` menolak perubahan `currency` (409) selama event masih punya ticket type dengan `price > 0`. Kurs tetap boleh diubah kapan saja.

## Perubahan data (migration `0011_event_currency.sql`)

```ts
// server/db/schema/enums.ts
export const currency = pgEnum('currency', ['IDR', 'USD', 'SGD'])

// server/db/schema/events.ts — events
currency: currency().notNull().default('IDR'),
/** Rupiah per 1 unit of `currency`, e.g. 16250.0000. Null for IDR events. */
fxRateIdr: numeric({ precision: 18, scale: 4 }),
fxRateUpdatedAt: timestamp({ withTimezone: true }),
// check:
check('events_fx_rate', sql`(${t.currency} = 'IDR' and ${t.fxRateIdr} is null)
                         or (${t.currency} <> 'IDR' and ${t.fxRateIdr} > 0)`)

// ticketTypes.price: tidak ada perubahan kolom, artinya menjadi "minor unit dari events.currency"
```

`transactions` **tidak** mendapat kolom baru, dan `currency` tetap `'IDR'`. `TransactionItems` (`shared/schemas/transaction.ts`) mendapat field opsional:

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
- `toMinor(major: string | number, cur)`: parsing berbasis string supaya `0.29 → 29` dan `149.5 → 14950` tidak terkena masalah float. Input dengan lebih dari 2 desimal ditolak, dan IDR harus bilangan bulat.
- `toMajor(minor, cur)`.
- `convertToIdr(minor, cur, rateIdr: string)` memakai BigInt dan ceil. Untuk IDR, nilai dikembalikan apa adanya.
- `formatMoney(minor, cur)` menghasilkan `Rp 2,500,000` / `US$ 149.50` / `S$ 200.00`. `formatRupiah` tetap ada.
- `tests/unit/money.test.ts`: pembulatan, harga 0, nilai besar, input tidak valid, dan IDR passthrough.

### Task 2 — Schema + migration
- Enum `currency`, kolom `events.currency` / `fxRateIdr` / `fxRateUpdatedAt`, dan check `events_fx_rate`.
- Jalankan `bun run db:generate`, lalu cek SQL-nya: hanya boleh berisi `ADD COLUMN` dengan default dan `ADD CONSTRAINT`, tanpa drop atau rewrite.
- `seed.ts`: tambahkan satu event USD dengan kurs contoh untuk dev.

### Task 3 — Event settings: mata uang + kurs
- `shared/schemas/event.ts`: form event mendapat `currency` dan `fxRateIdr` (string desimal, > 0, maks 4 desimal). Pakai `superRefine`: kurs wajib jika currency bukan IDR, dan kurs dikosongkan jika IDR.
- `server/services/events.ts` (create/update):
  - Simpan `currency`/`fxRateIdr`. `fxRateUpdatedAt = now()` hanya diisi saat kurs berubah.
  - Jika `currency` berubah dan event punya ticket type `price > 0`, tolak dengan **409** *"Change the currency before adding paid ticket types, or set their prices to 0 first."*
- `settings/edit.vue` + form pembuatan event (`admin/events/new.vue`): select Currency. Field "Exchange rate (Rp per 1 USD)" muncul jika bukan IDR. Select currency di-disable dengan penjelasan jika sudah ada tiket berbayar. Teks bantuan: *"Rate changes apply to new invoices only. Unpaid invoices keep the rate they were issued with."*
- `settings/index.vue` (tab overview): tampilkan Currency dan "1 USD = Rp 16,250 · updated …".
- Permission: `events.manage` yang sudah ada, tidak perlu permission baru.

### Task 4 — Ticket type mengikuti mata uang event
- `shared/schemas/event.ts` (ticket form): `price` diterima sebagai angka mayor. Server membaca currency event, lalu `toMinor(price, event.currency)`. Validasi desimal juga dilakukan di server, bukan hanya di UI.
- `app/components/admin/TicketForm.vue`: prefix input mengikuti mata uang event, `step` 0.01 untuk USD/SGD, dan help text "≈ Rp X at the current rate". "per person" memakai `formatMoney`.
- `server/api/admin/tickets/*` + `services/events.ts`: response ticket menyertakan `currency` (join ke event). Sort `price` di daftar tiket lintas event memakai `(events.currency, price)` supaya mata uang tidak tercampur.
- Daftar tiket (`tickets/index.vue`, tab tiket di `settings/index.vue`) memakai `formatMoney`.

### Task 5 — Konversi saat invoice dibuat (inti)
- `server/services/payment.ts` → `createInvoice` (sudah join `events`):
  - IDR: tidak ada perubahan perilaku.
  - USD/SGD: `totalIdr = convertToIdr(t.price, e.currency, e.fxRateIdr)`. `items.lines[].unitPrice/subtotal` diisi dalam IDR, `items.fx = { currency, unitPrice, total, rateIdr, rateAt: now }`, dan `total = totalIdr`.
  - Harga 0 tetap gratis.
- `ensureCheckout` / `doku.ts`: **tidak berubah** (`currency: 'IDR'`, amount = `total`, dan jumlah line_items IDR sama dengan amount).
- Untuk pendaftaran yang harus diverifikasi admin, kurs yang dipakai adalah kurs saat admin memverifikasi (saat invoice dibuat).

### Task 6 — Tampilan publik
- `events/[slug]/index.vue` dan `register.vue`: harga ditampilkan dalam mata uang event, plus `≈ Rp X` untuk USD/SGD dan catatan *"Charged in IDR. The final rupiah amount is fixed when your invoice is issued."* Payload event publik ditambah `currency` dan `fxRateIdr`.
- `payment/finish.vue`: jika ada `fx`, tampilkan total IDR beserta harga asli.

### Task 7 — Admin transaksi, email, export
- `transactions/index.vue` dan `[id].vue`, `registrations/[userId].vue`: total tetap IDR, ditambah baris "US$ 149.50 @ Rp 16,250" jika ada `fx`.
- `server/services/context.ts` + `mail/templates.ts`: email invoice dan paid menampilkan harga asli, kurs, dan total IDR. `ticketPrice` memakai `formatMoney(price, event.currency)`. Preview di `email-templates/[key].get.ts` mendapat contoh USD.
- `exports/transactions.get.ts`: tambah kolom `Original currency`, `Original amount`, `FX rate (IDR)`.
- Refund: tidak berubah. `refundAmount` = IDR yang dibayar.
- Dashboard revenue: tetap IDR. Tambahkan catatan kecil "in IDR" pada event non-IDR.

### Task 8 — Verifikasi
- `bun run typecheck`, `bun run test`.
- Manual (DOKU mode simulated):
  1. Event USD dengan kurs 16250 dan tiket US$ 149.50, lalu daftar. Invoice harus Rp 2,429,375, dan payload DOKU harus `currency: IDR, amount: 2429375` dengan jumlah line items sama dengan amount.
  2. Ubah kurs event. Invoice lama tetap, invoice baru memakai kurs baru.
  3. Ganti mata uang pada event yang punya tiket berbayar → 409. Pada event tanpa tiket berbayar → berhasil.
  4. Simpan event USD tanpa kurs → ditolak oleh form, API, dan constraint DB.
  5. Notifikasi DOKU (signature valid) dengan amount IDR: `markPaid` sukses. Amount yang berbeda ditolak.
  6. Event IDR yang sudah ada tidak berubah tampilan maupun perilakunya.

## Urutan & dependensi

```
T1 money utils ─> T2 schema ─> T3 event settings ─┬─> T4 ticket ─> T6 publik
                                                  └─> T5 invoice ─> T7 transaksi/email/export
                                                                         └─> T8 verifikasi
```

Estimasi: 1 PR. Migration-nya hanya menambah (kolom ber-default + constraint yang lolos untuk semua baris lama), jadi kode bisa di-rollback tanpa rollback DB.

## Risiko & hal yang perlu dicek

- **Pembulatan ke atas** membuat peserta membayar paling banyak Rp 1 lebih. Jika ingin dibulatkan ke Rp 100 / Rp 1.000, cukup ubah `convertToIdr`.
- **Kurs diisi manual** per event. Kurs otomatis dari API pihak ketiga bisa jadi fitur lanjutan.
- **Riwayat kurs:** yang disimpan hanya nilai terakhir + `fxRateUpdatedAt`. Audit per transaksi tetap tersedia lewat snapshot `items.fx`.
- **Kunci mata uang (prinsip 6):** jika admin perlu ganti mata uang setelah tiket dibuat, harga tiket berbayar harus di-nol-kan atau tiketnya dihapus dulu. Alternatifnya konversi otomatis harga saat mata uang diganti, tapi itu di luar scope.
