<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const list = useListQuery({
  sort: 'date',
  dir: 'desc',
  filters: { status: undefined, eventId: undefined, method: undefined, from: undefined, to: undefined } as Record<'status' | 'eventId' | 'method' | 'from' | 'to', string | undefined>
})
const { q, page, pageSize, filters, query, sortHeader } = list

const { data, status } = await useFetch('/api/admin/transactions', { query, watch: [query] })
const { data: options } = await useFetch('/api/admin/events/options')

const summary = computed(() => data.value?.summary)
const stats = computed(() => [
  { label: 'Total transaksi', value: formatNumber(summary.value?.total ?? 0), icon: 'i-lucide-receipt' },
  { label: 'Lunas', value: formatNumber(summary.value?.paid ?? 0), icon: 'i-lucide-circle-check' },
  { label: 'Menunggu pembayaran', value: formatNumber(summary.value?.pending ?? 0), icon: 'i-lucide-clock' },
  { label: 'Total pendapatan', value: formatRupiah(summary.value?.revenue ?? 0), icon: 'i-lucide-wallet' }
])

// ── filter ──
const filterOpen = ref(Object.values(filters).some(Boolean))
const draft = reactive({ ...filters })
const ALL = '__all'
const withAll = (label: string, items: { label: string, value: string }[]) => [{ label, value: ALL }, ...items]
const statusItems = withAll('Semua status', toItems(TRANSACTION_STATUS))
const eventItems = computed(() => withAll('Semua acara', (options.value?.events ?? []).map(e => ({ label: e.name, value: e.id }))))
const methodItems = withAll('Semua metode', toItems(PAYMENT_METHOD))
const pick = (key: 'status' | 'eventId' | 'method') => computed({
  get: () => draft[key] ?? ALL,
  set: (v: string) => { draft[key] = v === ALL ? undefined : v }
})
const fStatus = pick('status')
const fEvent = pick('eventId')
const fMethod = pick('method')
const activeFilters = computed(() => Object.values(filters).filter(Boolean).length)
const applyFilters = () => Object.assign(filters, { ...draft, from: draft.from || undefined, to: draft.to || undefined })
function resetFilters() {
  for (const k of Object.keys(draft) as (keyof typeof draft)[]) draft[k] = undefined
  applyFilters()
}

// ── pilihan ──
const rows = computed(() => data.value?.rows ?? [])
type Row = (typeof rows.value)[number]
const selected = ref<Set<string>>(new Set())
watch(rows, () => { selected.value = new Set([...selected.value].filter(id => rows.value.some(r => r.id === id))) })
const allState = computed(() => {
  const n = rows.value.filter(r => selected.value.has(r.id)).length
  return n === 0 ? false : n === rows.value.length ? true : 'indeterminate' as const
})
const toggleAll = (v: boolean | 'indeterminate') => { selected.value = v === true ? new Set(rows.value.map(r => r.id)) : new Set() }
function toggleRow(id: string, v: boolean | 'indeterminate') {
  const s = new Set(selected.value)
  if (v === true) s.add(id)
  else s.delete(id)
  selected.value = s
}

const UCheckbox = resolveComponent('UCheckbox')
const columns = computed<TableColumn<Row>[]>(() => [
  { id: 'select', header: () => h(UCheckbox, { 'modelValue': allState.value, 'onUpdate:modelValue': toggleAll, 'aria-label': 'Pilih semua transaksi di halaman ini' }), enableHiding: false },
  { id: 'id', header: sortHeader('id', 'ID transaksi'), enableHiding: false },
  { id: 'name', header: sortHeader('name', 'Peserta'), meta: { label: 'Peserta' } },
  { id: 'type', header: sortHeader('type', 'Tipe tiket'), meta: { label: 'Tipe tiket' } },
  { id: 'event', header: sortHeader('event', 'Acara'), meta: { label: 'Acara' } },
  { id: 'amount', header: sortHeader('amount', 'Jumlah'), meta: { label: 'Jumlah', class: { th: 'text-right', td: 'text-right' } } },
  { id: 'method', header: sortHeader('method', 'Metode'), meta: { label: 'Metode' } },
  { id: 'status', header: sortHeader('status', 'Status'), meta: { label: 'Status' } },
  { id: 'date', header: sortHeader('date', 'Tanggal'), meta: { label: 'Tanggal' } },
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

const methodText = (r: Row) => r.method ? (r.method === 'virtual_account' && r.channel ? `VA ${r.channel}` : PAYMENT_METHOD[r.method]) : '—'

const exportUrl = (ids?: string[]) => {
  const params = new URLSearchParams(Object.entries(query.value).map(([k, v]) => [k, String(v)]))
  if (ids?.length) params.set('ids', ids.join(','))
  return `/api/admin/transactions/export?${params}`
}

const total = computed(() => data.value?.total ?? 0)
const rangeText = computed(() => {
  if (!total.value) return 'Tidak ada transaksi'
  const from = (page.value - 1) * pageSize.value + 1
  return `Menampilkan ${formatNumber(from)}–${formatNumber(Math.min(total.value, page.value * pageSize.value))} dari ${formatNumber(total.value)} transaksi`
})
</script>

<template>
  <AdminPageHeader title="Transaksi" description="Pembayaran tiket dari peserta yang mendaftar.">
    <template #actions>
      <UButton :to="exportUrl()" external download color="neutral" variant="outline" icon="i-lucide-download" label="Ekspor CSV" />
    </template>
  </AdminPageHeader>

  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <AdminStatCard v-for="s in stats" :key="s.label" v-bind="s" />
  </div>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-3">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Cari ID transaksi atau nama peserta" aria-label="Cari ID transaksi atau nama peserta" class="w-full sm:w-80" />
      <div class="ml-auto flex gap-2">
        <UButton color="neutral" variant="outline" icon="i-lucide-list-filter" :label="activeFilters ? `Filter (${activeFilters})` : 'Filter'" :aria-expanded="filterOpen" aria-controls="filter-transaksi" @click="filterOpen = !filterOpen" />
        <UDropdownMenu :items="columnMenu" :content="{ align: 'end' }">
          <UButton color="neutral" variant="outline" icon="i-lucide-columns-3" label="Kolom" />
        </UDropdownMenu>
      </div>
    </div>

    <div v-if="filterOpen" id="filter-transaksi" class="grid gap-3 rounded-xl bg-muted p-4 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
      <UFormField label="Status">
        <USelect v-model="fStatus" :items="statusItems" class="w-full" />
      </UFormField>
      <UFormField label="Acara">
        <USelect v-model="fEvent" :items="eventItems" class="w-full" />
      </UFormField>
      <UFormField label="Metode">
        <USelect v-model="fMethod" :items="methodItems" class="w-full" />
      </UFormField>
      <UFormField label="Dari tanggal">
        <UInput v-model="draft.from" type="date" class="w-full" />
      </UFormField>
      <UFormField label="Sampai tanggal">
        <UInput v-model="draft.to" type="date" class="w-full" />
      </UFormField>
      <div class="flex items-end gap-2">
        <UButton color="neutral" variant="ghost" label="Reset" @click="resetFilters" />
        <UButton label="Terapkan" @click="applyFilters" />
      </div>
    </div>

    <div v-if="selected.size" role="region" aria-label="Aksi massal" class="flex flex-wrap items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5">
      <span aria-live="polite" class="text-sm font-semibold text-brand-950">{{ selected.size }} transaksi dipilih</span>
      <UButton class="ml-auto" size="sm" color="neutral" variant="outline" icon="i-lucide-download" label="Ekspor" :to="exportUrl([...selected])" external download />
    </div>

    <UTable v-model:column-visibility="columnVisibility" :data="rows" :columns="columns" :loading="status === 'pending'" empty="Tidak ada transaksi yang cocok." class="-mx-4 sm:-mx-5">
      <template #select-cell="{ row }">
        <UCheckbox :model-value="selected.has(row.original.id)" :aria-label="`Pilih ${row.original.invoiceNo}`" @update:model-value="toggleRow(row.original.id, $event)" />
      </template>
      <template #id-cell="{ row }">
        <NuxtLink :to="`/admin/transaksi/${row.original.id}`" class="font-mono text-[13px] font-medium text-primary hover:underline">
          {{ row.original.invoiceNo }}
        </NuxtLink>
      </template>
      <template #name-cell="{ row }">
        <NuxtLink v-if="row.original.userId" :to="`/admin/peserta/${row.original.userId}`" class="font-semibold text-highlighted hover:underline">
          {{ row.original.participantName }}
        </NuxtLink>
        <span v-else class="font-semibold text-highlighted">{{ row.original.participantName }}</span>
        <div class="text-xs text-muted">{{ row.original.participantEmail }}</div>
      </template>
      <template #type-cell="{ row }">
        <UBadge color="neutral" variant="outline" :label="row.original.ticketTypeName" />
      </template>
      <template #event-cell="{ row }">
        {{ row.original.eventName }}
      </template>
      <template #amount-cell="{ row }">
        <span class="whitespace-nowrap font-medium tabular-nums">{{ formatRupiah(row.original.total) }}</span>
      </template>
      <template #method-cell="{ row }">
        <span class="text-muted">{{ methodText(row.original) }}</span>
      </template>
      <template #status-cell="{ row }">
        <UBadge v-bind="TRANSACTION_STATUS[row.original.status]" />
      </template>
      <template #date-cell="{ row }">
        <span class="whitespace-nowrap text-muted">{{ formatDateTime(row.original.createdAt) }}</span>
      </template>
      <template #actions-cell="{ row }">
        <div class="text-right">
          <UButton :to="`/admin/transaksi/${row.original.id}`" size="sm" color="neutral" variant="outline" icon="i-lucide-eye" label="Detail" />
        </div>
      </template>
    </UTable>

    <AdminListFooter v-model:page="page" v-model:page-size="pageSize" :total="total" :range-text="rangeText" />
  </AdminPanel>
</template>
