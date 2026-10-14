# Admin per event: event switcher & manajemen event

- **Tanggal:** 2026-10-13
- **Status:** Disetujui, menunggu review spec
- **Stack:** Nuxt 4.6, @nuxt/ui 4.11, Drizzle/Postgres, better-auth, Zod 4

## 1. Tujuan

Admin selalu bekerja di dalam konteks **satu event**. Dashboard, Registrations, dan Transactions hanya menampilkan data event yang sedang dipilih. Event dipilih lewat **event switcher** di sidebar. Manajemen event dipindah dari menu sidebar "Events" ke dalam switcher: "Kelola semua event" dan "Event baru" untuk urusan lintas event, serta menu "Event settings" untuk event yang sedang aktif.

### Kriteria sukses
- Admin tidak pernah melihat data campuran dari beberapa event di Dashboard, Registrations, Transactions, maupun export.
- Event aktif terlihat dari URL. Link bisa dibagikan, dan tab browser yang berbeda bisa membuka event yang berbeda.
- `/admin` langsung membuka event terakhir yang dipakai.
- Event yang punya transaksi `pending`, `paid`, atau `refunded` tidak bisa dihapus.

### Di luar scope
- Izin per event (semua admin tetap bisa mengakses semua event).
- Redirect dari URL admin lama.
- Perubahan schema database atau migrasi.
- Email templates (tetap global dan didefinisikan di kode).

## 2. Kondisi saat ini (ringkas)

- DB dan API sudah mendukung banyak event. `participants.eventId` dan `transactions.eventId` sudah ter-index, dan endpoint list/export/dashboard sudah menerima `?eventId` opsional.
- Event terpilih hanya ada sebagai `ref` lokal di `app/pages/admin/index.vue:4`, dan sebagai filter URL di halaman list (`app/composables/useListQuery.ts`).
- Sidebar adalah array statis di `app/layouts/admin.vue:7-13`.
- `/admin/participants/[id]` memakai **userId**. Halaman ini adalah profil lintas event.
- `transactions.eventId` bersifat `ON DELETE SET NULL`, sehingga transaksi bisa tertinggal tanpa event setelah event dihapus.

## 3. Peta route

### Dalam scope event (parent: `app/pages/admin/e/[eventId].vue`)

| Route | Isi | Asal file |
|---|---|---|
| `/admin/e/[eventId]` | Dashboard (tanpa `USelect` event) | `admin/index.vue` |
| `/admin/e/[eventId]/registrations` | Daftar registrasi (tanpa filter event & kolom Event) | `admin/participants/index.vue` |
| `/admin/e/[eventId]/registrations/[userId]` | Profil participant (lihat §5.4) | `admin/participants/[id].vue` |
| `/admin/e/[eventId]/transactions` | Daftar transaksi (tanpa filter event & kolom Event) | `admin/transactions/index.vue` |
| `/admin/e/[eventId]/transactions/[id]` | Detail transaksi | `admin/transactions/[id].vue` |
| `/admin/e/[eventId]/settings?tab=` | Tab Overview, Agenda, Speakers, Partners, Tickets, Scanner, Delete/Archive | `admin/events/[id]/index.vue` |
| `/admin/e/[eventId]/settings/edit` | Form edit event | `admin/events/[id]/edit.vue` |

Tab **Participants** di settings dihapus, karena isinya sudah tercakup oleh menu Registrations. `app/components/admin/EventParticipants.vue` dihapus, karena hanya dipakai oleh tab itu. Query `breakdown` dan field `participantBreakdown` di `server/api/admin/events/[id].get.ts` juga dihapus karena tidak ada lagi yang memakainya.

### Global

| Route | Perilaku |
|---|---|
| `/admin` | Halaman ini hanya meneruskan admin, tanpa konten. Urutannya: (1) event dari cookie `admin_last_event`, kalau masih ada; (2) event dengan `startDate` terbaru; (3) kalau belum ada event, empty state "Buat event pertama". |
| `/admin/events` | "Kelola semua event": daftar dan aksi. Nama event menautkan ke `/admin/e/[id]/settings`. |
| `/admin/events/new` | Setelah berhasil: `refreshNuxtData('admin-events')`, lalu navigasi ke `/admin/e/[newId]/settings`. |
| `/admin/email-templates` | Tidak berubah. |

URL lama (`/admin/participants*`, `/admin/transactions*`, `/admin/events/[id]*`) dihapus **tanpa redirect**. Tidak ada email atau kode server yang menautkan ke halaman admin, dan `app/error.vue` sudah mengarahkan error di `/admin*` kembali ke `/admin`.

### Aturan konsistensi: record harus cocok dengan event di URL

- **Detail transaksi:** kalau `trx.event.id` ≠ `route.params.eventId`, lakukan `navigateTo(…, { replace: true })` ke `/admin/e/{trx.event.id}/transactions/{id}`. Kalau `trx.event` null, tampilkan 404. Kasus ini hanya bisa terjadi untuk transaksi `expired` (lihat §6).
- **Profil participant:** kalau user tidak punya registrasi di event dari URL tapi punya registrasi di event lain, redirect (`replace`) ke event registrasi terbarunya. Kalau user tidak punya registrasi sama sekali, tampilkan 404.

## 4. Sidebar & event switcher

### Struktur

```
[A] APCR CMS / Admin panel         ← header, tidak berubah
[ APCR 2026 · Published      ▾ ]   ← AdminEventSwitcher
EVENT
  Dashboard        /admin/e/{id}          (exact)
  Registrations    /admin/e/{id}/registrations
  Transactions     /admin/e/{id}/transactions
  Event settings   /admin/e/{id}/settings
WORKSPACE
  Email templates  /admin/email-templates
───
Admin · Sign out                    ← footer, tidak berubah
```

`{id}` = `useCurrentEvent().id`. Di halaman global, nilainya diambil dari cookie `admin_last_event`.

Kalau belum ada event sama sekali, switcher dan grup EVENT disembunyikan. Yang tampil hanya tombol "+ Buat event pertama" dan grup WORKSPACE.

### `app/components/admin/EventSwitcher.vue`

- `UDropdownMenu`. Item:
  1. **Semua event**, diurutkan `startDate desc`. Setiap item berisi nama, badge status (draft/published/archived), dan ikon ✓ di event aktif.
  2. Separator.
  3. "Kelola semua event" → `/admin/events`.
  4. "+ Event baru" → `/admin/events/new`.
- Trigger menampilkan nama event aktif dan badge statusnya.
- Saat memilih event, navigasi ke `switchEventPath(route.path, route.query, newId)` (§4.1).

### 4.1 `switchEventPath()` (`app/utils/switchEventPath.ts`)

Fungsi murni. Aturannya: admin tetap di **section yang sama** tapi kembali ke halaman utama section itu. ID detail dan filter dibuang. Hanya `?tab` di settings yang dipertahankan.

| Dari | Ke |
|---|---|
| `/admin/e/A` | `/admin/e/B` |
| `/admin/e/A/registrations?status=paid&page=3` | `/admin/e/B/registrations` |
| `/admin/e/A/registrations/u1` | `/admin/e/B/registrations` |
| `/admin/e/A/transactions/t1` | `/admin/e/B/transactions` |
| `/admin/e/A/settings?tab=agenda` | `/admin/e/B/settings?tab=agenda` |
| `/admin/e/A/settings/edit` | `/admin/e/B/settings` |
| `/admin/events`, `/admin/email-templates`, path lain | `/admin/e/B` |

## 5. State & data flow

### 5.1 Daftar event
- Layout: `useFetch('/api/admin/event-options', { key: 'admin-events' })`.
- Parent route `[eventId].vue` memakai key yang sama, sehingga hanya ada satu request dan satu cache.
- Dipanggil `refreshNuxtData('admin-events')` setelah create, edit (nama/status bisa berubah), archive, dan delete event.

### 5.2 `useCurrentEvent()` (`app/composables/useCurrentEvent.ts`)
Mengembalikan `{ id: ComputedRef<string | null>, event: ComputedRef<EventOption | null> }`.
- `id` = `route.params.eventId`. Kalau tidak ada di route, pakai nilai cookie `admin_last_event`.
- `event` = item yang cocok di daftar `admin-events`.
- Dipakai oleh layout, switcher, dan semua child page.

### 5.3 Parent route `app/pages/admin/e/[eventId].vue`
- `definePageMeta({ layout: 'admin', middleware: 'admin' })`. Child page mewarisi middleware ini.
- Menunggu daftar `admin-events`. Kalau `eventId` tidak ada di daftar: `throw createError({ statusCode: 404, statusMessage: 'Event not found' })`.
- Menulis cookie `admin_last_event` (`useCookie`, `maxAge` 1 tahun, `sameSite: 'lax'`) setiap kali `eventId` berubah.
- Merender `<NuxtPage />`.

Catatan: layout tidak bisa menerima `provide()` dari page karena layout adalah parent-nya. Karena itu state dibaca dari route dan dari `useFetch` dengan key yang sama.

### 5.4 Profil participant
Isi halaman, dari atas ke bawah:
1. Profil user (tidak berubah).
2. **Registrasi untuk event ini**: kartu reg no, status, payment, QR e-ticket, dan check-in. Bagian ini memakai perubahan QR yang belum di-commit di `server/api/admin/users/[id].get.ts`.
3. **Event lain**: daftar registrasi di event lain. Setiap baris menautkan ke `/admin/e/{eventId}/registrations/{userId}`.
4. **Riwayat transaksi (semua event)**: baris dengan `eventId` menautkan ke `/admin/e/{eventId}/transactions/{id}`. Baris dengan `eventId` null ditampilkan tanpa link, hanya data snapshot.

## 6. Perubahan API

| File | Perubahan |
|---|---|
| `shared/schemas/participant.ts` | `participantListQuery.eventId` dan `transactionListQuery.eventId` menjadi **wajib** (`z.uuid()`). Nilai `'event'` dihapus dari enum `sort` keduanya. Berlaku otomatis untuk `exports/participants.get.ts` dan `exports/transactions.get.ts`. |
| `server/services/lists.ts` | Hapus key sort `event` (baris 14 & 80). Filter `eventId` (baris 27 & 93) dibuat tanpa syarat. |
| `server/api/admin/events/[id].get.ts` | Hapus `breakdown` / `participantBreakdown` (lihat §3). |
| `server/api/admin/dashboard.get.ts` | `eventId` wajib. Fallback "event dengan registrasi terbanyak" dan field `events` di response dihapus. Event tidak ditemukan → 404. |
| `server/api/admin/event-options.get.ts` | Menerima `?eventId` opsional (`z.uuid()`). Kalau diisi, `ticketTypeNames` hanya berisi tipe tiket event tersebut. |
| `server/api/admin/users/[id].get.ts` | Select transaksi ditambah `eventId: transactions.eventId`. |
| `server/services/events.ts` | Guard penghapusan event (§6.1). `deleteImpact()` mendapat field `transactions`. |

Tidak berubah: `requireAdmin()`, endpoint CRUD events lainnya, scanner publik, schema DB.

### 6.1 Guard penghapusan event
- Di dalam `db.transaction` pada `deleteEvent()`, **sebelum** menghapus participants, hitung transaksi dengan `eventId = id AND status IN ('pending', 'paid', 'refunded')`.
- Kalau jumlahnya lebih dari 0: `createError({ statusCode: 409, statusMessage: 'This event has N active or paid transactions. Archive it instead of deleting.' })`.
- `pending` ikut diblokir karena link pembayaran DOKU masih aktif sampai invoice kedaluwarsa. Pembayaran yang masuk setelah event dihapus akan menghasilkan transaksi `paid` tanpa event.
- `deleteImpact()` menghitung transaksi dengan filter yang sama dan mengembalikannya sebagai `transactions`. UI di `/admin/events` dan di settings menonaktifkan tombol Delete (dengan tooltip penjelasan) kalau `transactions > 0`, dan menampilkan tombol "Archive". Guard di service tetap menjadi pertahanan utama.
- Konsekuensinya, transaksi dengan `eventId = null` hanya berasal dari event yang semua transaksinya `expired`, sehingga aman kalau transaksi itu tidak muncul di list atau export per event.
- Batasan yang diterima: ada jendela race yang sangat kecil antara pengecekan dan delete, misalnya webhook yang membuat transaksi baru di saat yang sama. Risikonya rendah karena transaksi dibuat lewat registrasi, bukan oleh webhook.

### 6.2 Amandemen saat planning (2026-10-13)
- **Aksi Archive belum ada** di aplikasi. Form hanya mengenal `draft` dan `published`. Ditambahkan `POST /api/admin/events/[id]/archive` (service `archiveEvent()`). Event yang diarsipkan bisa dikembalikan lewat Edit, karena form memetakan status non-published ke `draft`.
- Daftar event untuk switcher memakai `useState('admin-events')` dengan `load(force)` eksplisit, menggantikan `useFetch` + `refreshNuxtData` di §5.1. Alasannya, beberapa instance `useFetch` dengan key yang sama berbagi aturan dedupe dan cache yang mudah keliru.
- Label UI memakai bahasa Inggris seperti layar admin lainnya: "Manage events" dan "New event".

## 7. Penanganan error

| Kondisi | Hasil |
|---|---|
| `eventId` di URL bukan UUID | Parent route: 404 (tidak ada di daftar). API: 400 dari Zod. |
| `eventId` UUID valid tapi event tidak ada / sudah dihapus | Parent route: 404 → `error.vue` → tombol kembali ke `/admin`. |
| Cookie `admin_last_event` menunjuk event yang sudah dihapus | `/admin` mengabaikan cookie dan memakai event dengan `startDate` terbaru. |
| Request list/export/dashboard tanpa `eventId` | 400. Ini sengaja: lebih baik gagal jelas daripada diam-diam menampilkan data semua event. |
| Delete event yang punya transaksi aktif/lunas | 409 dengan pesan untuk mengarsipkan. |

## 8. Testing

### Unit (Vitest, tanpa `@nuxt/test-utils`)
- Tambahkan `vitest` sebagai devDependency, script `"test": "vitest run"`, dan `vitest.config.ts` minimal (environment `node`).
- `app/utils/switchEventPath.test.ts`: semua baris tabel §4.1, ditambah trailing slash dan query kosong.

### Typecheck
- `bun run typecheck` lulus (proyek memakai bun, lihat `bun.lock`).

### Checklist manual (browser)
1. `/admin` tanpa cookie → event dengan `startDate` terbaru. Setelah memilih event lain, buka `/admin` lagi → event terakhir.
2. Ganti event dari Registrations dengan filter aktif → pindah ke Registrations event baru, filter kosong.
3. Ganti event dari settings `?tab=agenda` → tab Agenda di event baru.
4. Buka `/admin/e/{A}/transactions/{trx milik B}` → di-redirect ke URL event B, switcher menampilkan B.
5. Buka profil user yang hanya terdaftar di event B lewat URL event A → di-redirect ke event B.
6. Dua tab dengan event berbeda → masing-masing tetap konsisten.
7. UUID acak di `/admin/e/{uuid}` → halaman 404 dengan jalan kembali ke `/admin`.
8. Export registrations/transactions → hanya berisi data event aktif.
9. Filter Ticket type di Registrations hanya menampilkan tipe tiket event aktif.
10. Delete event yang punya transaksi `paid` → tombol disabled. Request langsung ke API → 409.
11. Delete event yang hanya punya transaksi `expired` → berhasil, daftar di switcher ter-refresh, `/admin` tetap berfungsi.
12. Database tanpa event → sidebar hanya menampilkan "Buat event pertama" dan Email templates.
13. Event baru → redirect ke settings event tersebut, dan event muncul di switcher.
14. Sidebar mobile (drawer): switcher berfungsi dan drawer tertutup setelah navigasi.
