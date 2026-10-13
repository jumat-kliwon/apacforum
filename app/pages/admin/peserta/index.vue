<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const notify = useNotify()
const list = useListQuery({
  sort: 'date',
  dir: 'desc',
  filters: { eventId: undefined, ticketTypeName: undefined, status: undefined, paymentStatus: undefined } as Record<'eventId' | 'ticketTypeName' | 'status' | 'paymentStatus', string | undefined>
})
const { q, page, pageSize, filters, query, sortHeader } = list

const { data, status, refresh } = await useFetch('/api/admin/participants', { query, watch: [query] })
const { data: options } = await useFetch('/api/admin/events/options')

// ── filter (diterapkan lewat tombol "Terapkan") ──
const filterOpen = ref(Object.values(filters).some(Boolean))
const draft = reactive({ ...filters })
const ALL = '__all'
const withAll = (label: string, items: { label: string, value: string }[]) => [{ label, value: ALL }, ...items]
const eventItems = computed(() => withAll('Semua acara', (options.value?.events ?? []).map(e => ({ label: e.name, value: e.id }))))
const typeItems = computed(() => withAll('Semua tipe', (options.value?.ticketTypeNames ?? []).map(n => ({ label: n, value: n }))))
const regItems = withAll('Semua status', toItems(REGISTRATION_STATUS))
const payItems = withAll('Semua status', toItems(PAYMENT_STATUS))
const pick = (key: keyof typeof draft) => computed({
  get: () => draft[key] ?? ALL,
  set: (v: string) => { draft[key] = v === ALL ? undefined : v }
})
const fEvent = pick('eventId')
const fType = pick('ticketTypeName')
const fReg = pick('status')
const fPay = pick('paymentStatus')
const activeFilters = computed(() => Object.values(filters).filter(Boolean).length)
function applyFilters() {
  Object.assign(filters, draft)
}
function resetFilters() {
  for (const k of Object.keys(draft) as (keyof typeof draft)[]) draft[k] = undefined
  applyFilters()
}

// ── pilihan baris ──
const selected = ref<Set<string>>(new Set())
const rows = computed(() => data.value?.rows ?? [])
watch(rows, () => { selected.value = new Set([...selected.value].filter(id => rows.value.some(r => r.id === id))) })
const allState = computed(() => {
  const n = rows.value.filter(r => selected.value.has(r.id)).length
  return n === 0 ? false : n === rows.value.length ? true : 'indeterminate' as const
})
function toggleAll(v: boolean | 'indeterminate') {
  selected.value = v === true ? new Set(rows.value.map(r => r.id)) : new Set()
}
function toggleRow(id: string, v: boolean | 'indeterminate') {
  const s = new Set(selected.value)
  if (v === true) s.add(id)
  else s.delete(id)
  selected.value = s
}

// ── kolom ──
type Row = (typeof rows.value)[number]
const UCheckbox = resolveComponent('UCheckbox')
const columns = computed<TableColumn<Row>[]>(() => [
  {
    id: 'select',
    header: () => h(UCheckbox, { 'modelValue': allState.value, 'onUpdate:modelValue': toggleAll, 'aria-label': 'Pilih semua peserta di halaman ini' }),
    enableHiding: false
  },
  { id: 'name', header: sortHeader('name', 'Nama peserta'), enableHiding: false },
  { id: 'type', header: sortHeader('type', 'Tipe peserta'), meta: { label: 'Tipe peserta' } },
  { id: 'event', header: sortHeader('event', 'Acara'), meta: { label: 'Acara' } },
  { id: 'org', header: sortHeader('org', 'Instansi'), meta: { label: 'Instansi' } },
  { id: 'reg', header: sortHeader('reg', 'Status pendaftaran'), meta: { label: 'Status pendaftaran' } },
  { id: 'pay', header: sortHeader('pay', 'Status pembayaran'), meta: { label: 'Status pembayaran' } },
  { id: 'date', header: sortHeader('date', 'Tanggal daftar'), meta: { label: 'Tanggal daftar' } },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Aksi'), enableHiding: false }
])
const columnVisibility = ref<Record<string, boolean>>({})
const columnMenu = computed<DropdownMenuItem[]>(() => columns.value
  .filter(c => c.enableHiding !== false)
  .map(c => ({
    label: (c.meta as { label: string }).label,
    type: 'checkbox' as const,
    checked: columnVisibility.value[c.id!] !== false,
    onUpdateChecked: (v: boolean) => { columnVisibility.value = { ...columnVisibility.value, [c.id!]: v } },
    onSelect: (e: Event) => e.preventDefault()
  })))

// ── aksi massal ──
const busy = ref(false)
const deleteOpen = ref(false)
async function bulk(action: 'verify' | 'email' | 'delete') {
  busy.value = true
  try {
    const res = await $fetch('/api/admin/participants/bulk', { method: 'POST', body: { action, ids: [...selected.value] } })
    const text = { verify: 'diverifikasi', email: 'dikirimi email', delete: 'dihapus' }[action]
    notify.success(`${res.affected} peserta ${text}`)
    selected.value = new Set()
    deleteOpen.value = false
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    busy.value = false
  }
}

const exportUrl = (ids?: string[]) => {
  const params = new URLSearchParams(Object.entries(query.value).map(([k, v]) => [k, String(v)]))
  if (ids?.length) params.set('ids', ids.join(','))
  return `/api/admin/participants/export?${params}`
}

const total = computed(() => data.value?.total ?? 0)
const rangeText = computed(() => {
  if (!total.value) return 'Tidak ada peserta'
  const from = (page.value - 1) * pageSize.value + 1
  const to = Math.min(total.value, page.value * pageSize.value)
  return `Menampilkan ${formatNumber(from)}–${formatNumber(to)} dari ${formatNumber(total.value)} peserta`
})
</script>

<template>
  <AdminPageHeader
    title="Kelola peserta"
    description="Daftar peserta yang mendaftar lewat form Registration di website."
    :breadcrumb="[{ label: 'Pendaftaran' }, { label: 'Peserta' }]"
  >
    <template #actions>
      <UButton :to="exportUrl()" external download color="neutral" variant="outline" icon="i-lucide-download" label="Ekspor CSV" />
    </template>
  </AdminPageHeader>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-3">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Cari nama, email, atau instansi" aria-label="Cari nama, email, atau instansi" class="w-full sm:w-80" />
      <div class="ml-auto flex gap-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-list-filter"
          :label="activeFilters ? `Filter (${activeFilters})` : 'Filter'"
          :aria-expanded="filterOpen"
          aria-controls="filter-peserta"
          @click="filterOpen = !filterOpen"
        />
        <UDropdownMenu :items="columnMenu" :content="{ align: 'end' }">
          <UButton color="neutral" variant="outline" icon="i-lucide-columns-3" label="Kolom" />
        </UDropdownMenu>
      </div>
    </div>

    <div v-if="filterOpen" id="filter-peserta" class="grid gap-3 rounded-xl bg-muted p-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
      <UFormField label="Acara">
        <USelect v-model="fEvent" :items="eventItems" class="w-full" />
      </UFormField>
      <UFormField label="Tipe peserta">
        <USelect v-model="fType" :items="typeItems" class="w-full" />
      </UFormField>
      <UFormField label="Status pendaftaran">
        <USelect v-model="fReg" :items="regItems" class="w-full" />
      </UFormField>
      <UFormField label="Status pembayaran">
        <USelect v-model="fPay" :items="payItems" class="w-full" />
      </UFormField>
      <div class="flex items-end gap-2">
        <UButton color="neutral" variant="ghost" label="Reset" @click="resetFilters" />
        <UButton label="Terapkan" @click="applyFilters" />
      </div>
    </div>

    <div v-if="selected.size" role="region" aria-label="Aksi massal" class="flex flex-wrap items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5">
      <span aria-live="polite" class="text-sm font-semibold text-brand-950">{{ selected.size }} peserta dipilih</span>
      <div class="ml-auto flex flex-wrap gap-2">
        <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-user-check" label="Verifikasi" :loading="busy" @click="bulk('verify')" />
        <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-mail" label="Kirim email" :loading="busy" @click="bulk('email')" />
        <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-download" label="Ekspor" :to="exportUrl([...selected])" external download />
        <UButton size="sm" color="error" variant="soft" icon="i-lucide-trash-2" label="Hapus" @click="deleteOpen = true" />
      </div>
    </div>

    <UTable
      v-model:column-visibility="columnVisibility"
      :data="rows"
      :columns="columns"
      :loading="status === 'pending'"
      empty="Tidak ada peserta yang cocok."
      class="-mx-4 sm:-mx-5"
      :ui="{ tr: 'data-[selected=true]:bg-brand-50/60' }"
    >
      <template #select-cell="{ row }">
        <UCheckbox :model-value="selected.has(row.original.id)" :aria-label="`Pilih ${row.original.name}`" @update:model-value="toggleRow(row.original.id, $event)" />
      </template>
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar :text="initials(row.original.name)" size="sm" class="bg-brand-50 text-brand-900" />
          <div class="min-w-0">
            <NuxtLink :to="`/admin/peserta/${row.original.userId}`" class="font-semibold text-highlighted hover:underline">
              {{ row.original.name }}
            </NuxtLink>
            <div class="text-xs text-muted">{{ row.original.email }}</div>
          </div>
        </div>
      </template>
      <template #type-cell="{ row }">
        <UBadge color="neutral" variant="outline" :label="row.original.ticketTypeName" />
      </template>
      <template #event-cell="{ row }">
        {{ row.original.eventName }}
      </template>
      <template #org-cell="{ row }">
        <span class="text-muted">{{ row.original.organization ?? '—' }}</span>
      </template>
      <template #reg-cell="{ row }">
        <UBadge v-bind="REGISTRATION_STATUS[row.original.status]" />
      </template>
      <template #pay-cell="{ row }">
        <UBadge v-bind="paymentStatusLabel(row.original.paymentStatus, row.original.status)" />
      </template>
      <template #date-cell="{ row }">
        <span class="whitespace-nowrap text-muted">{{ formatDateTime(row.original.createdAt) }}</span>
      </template>
      <template #actions-cell="{ row }">
        <div class="text-right">
          <UButton :to="`/admin/peserta/${row.original.userId}`" size="sm" color="neutral" variant="outline" icon="i-lucide-eye" label="Detail" />
        </div>
      </template>
    </UTable>

    <AdminListFooter v-model:page="page" v-model:page-size="pageSize" :total="total" :range-text="rangeText" />
  </AdminPanel>

  <AdminConfirmDialog
    v-model:open="deleteOpen"
    :title="`Hapus ${selected.size} pendaftaran?`"
    description="Data pendaftaran dan e-tiket mereka ikut terhapus. Riwayat transaksi tetap tersimpan untuk keperluan laporan keuangan. Tindakan ini tidak bisa dibatalkan."
    :confirm-label="`Hapus ${selected.size} pendaftaran`"
    :loading="busy"
    @confirm="bulk('delete')"
  />
</template>
