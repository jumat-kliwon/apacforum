<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { Component } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const list = useListQuery({
  sort: 'date',
  dir: 'desc',
  filters: { status: undefined, eventId: undefined, method: undefined, from: undefined, to: undefined } as Record<'status' | 'eventId' | 'method' | 'from' | 'to', string | undefined>
})
const { q, page, pageSize, filters, query, sortHeader } = list

const { data, status } = await useFetch('/api/admin/transactions', { query, watch: [query] })
const { data: options } = await useFetch('/api/admin/event-options')

const summary = computed(() => data.value?.summary)
const stats = computed(() => [
  { label: 'Total transactions', value: formatNumber(summary.value?.total ?? 0), icon: 'i-lucide-receipt' },
  { label: 'Paid', value: formatNumber(summary.value?.paid ?? 0), icon: 'i-lucide-circle-check' },
  { label: 'Awaiting payment', value: formatNumber(summary.value?.pending ?? 0), icon: 'i-lucide-clock' },
  { label: 'Total revenue', value: formatRupiah(summary.value?.revenue ?? 0), icon: 'i-lucide-wallet' }
])

// ── filters ──
const filterOpen = ref(Object.values(filters).some(Boolean))
const draft = reactive({ ...filters })
const ALL = '__all'
const withAll = (label: string, items: { label: string, value: string }[]) => [{ label, value: ALL }, ...items]
const statusItems = withAll('All statuses', toItems(TRANSACTION_STATUS))
const eventItems = computed(() => withAll('All events', (options.value?.events ?? []).map(e => ({ label: e.name, value: e.id }))))
const methodItems = withAll('All methods', toItems(PAYMENT_METHOD))
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

// ── selection ──
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

const UCheckbox = resolveComponent('UCheckbox') as Component
const columns = computed<TableColumn<Row>[]>(() => [
  { id: 'select', header: () => h(UCheckbox, { 'modelValue': allState.value, 'onUpdate:modelValue': toggleAll, 'aria-label': 'Select all transactions on this page' }), enableHiding: false },
  { id: 'id', header: sortHeader('id', 'Transaction ID'), enableHiding: false },
  { id: 'name', header: sortHeader('name', 'Participant'), meta: { label: 'Participant' } },
  { id: 'type', header: sortHeader('type', 'Ticket type'), meta: { label: 'Ticket type' } },
  { id: 'event', header: sortHeader('event', 'Event'), meta: { label: 'Event' } },
  { id: 'amount', header: sortHeader('amount', 'Amount'), meta: { label: 'Amount', class: { th: 'text-right', td: 'text-right' } } },
  { id: 'method', header: sortHeader('method', 'Method'), meta: { label: 'Method' } },
  { id: 'status', header: sortHeader('status', 'Status'), meta: { label: 'Status' } },
  { id: 'date', header: sortHeader('date', 'Date'), meta: { label: 'Date' } },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Actions'), enableHiding: false }
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
  return `/api/admin/exports/transactions?${params}`
}

const total = computed(() => data.value?.total ?? 0)
const rangeText = computed(() => {
  if (!total.value) return 'No transactions'
  const from = (page.value - 1) * pageSize.value + 1
  return `Showing ${formatNumber(from)}–${formatNumber(Math.min(total.value, page.value * pageSize.value))} of ${formatNumber(total.value)} transactions`
})
</script>

<template>
  <AdminPageHeader title="Transactions" description="Ticket payments from registered participants.">
    <template #actions>
      <UButton :to="exportUrl()" external download color="neutral" variant="outline" icon="i-lucide-download" label="Export CSV" />
    </template>
  </AdminPageHeader>

  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <AdminStatCard v-for="s in stats" :key="s.label" v-bind="s" />
  </div>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-4 p-2">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Search transaction ID or participant" aria-label="Search transaction ID or participant" class="w-full sm:w-80 sm:min-w-[200px]" />
      <div class="ml-auto flex gap-2">
        <UButton color="neutral" variant="outline" icon="i-lucide-list-filter" :label="activeFilters ? `Filters (${activeFilters})` : 'Filters'" :aria-expanded="filterOpen" aria-controls="transaction-filters" @click="filterOpen = !filterOpen" />
        <UDropdownMenu :items="columnMenu" :content="{ align: 'end' }">
          <UButton color="neutral" variant="outline" icon="i-lucide-columns-3" label="Columns" />
        </UDropdownMenu>
      </div>
    </div>

    <div v-if="filterOpen" id="transaction-filters" class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-end gap-4 rounded-lg border border-default bg-muted p-4">
      <UFormField label="Status">
        <USelect v-model="fStatus" :items="statusItems" class="w-full" />
      </UFormField>
      <UFormField label="Event">
        <USelect v-model="fEvent" :items="eventItems" class="w-full" />
      </UFormField>
      <UFormField label="Method">
        <USelect v-model="fMethod" :items="methodItems" class="w-full" />
      </UFormField>
      <UFormField label="From">
        <UInput v-model="draft.from" type="date" class="w-full" />
      </UFormField>
      <UFormField label="To">
        <UInput v-model="draft.to" type="date" class="w-full" />
      </UFormField>
      <div class="flex items-end justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Reset" @click="resetFilters" />
        <UButton label="Apply" @click="applyFilters" />
      </div>
    </div>

    <div v-if="selected.size" role="region" aria-label="Bulk actions" class="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-brand-50 px-5 py-3 dark:bg-[#2e2a18]">
      <span aria-live="polite" class="text-sm font-semibold text-highlighted">{{ selected.size }} selected</span>
      <UButton class="ml-auto" size="sm" color="neutral" variant="outline" icon="i-lucide-download" label="Export" :to="exportUrl([...selected])" external download />
    </div>

    <UTable v-model:column-visibility="columnVisibility" :data="rows" :columns="columns" :loading="status === 'pending'" empty="No transactions match these filters." class="-mx-4 sm:-mx-5">
      <template #select-cell="{ row }">
        <UCheckbox :model-value="selected.has(row.original.id)" :aria-label="`Select ${row.original.invoiceNo}`" @update:model-value="toggleRow(row.original.id, $event)" />
      </template>
      <template #id-cell="{ row }">
        <NuxtLink :to="`/admin/transactions/${row.original.id}`" class="font-mono text-[13px] font-medium text-primary hover:underline">
          {{ row.original.invoiceNo }}
        </NuxtLink>
      </template>
      <template #name-cell="{ row }">
        <NuxtLink v-if="row.original.userId" :to="`/admin/participants/${row.original.userId}`" class="font-semibold text-highlighted hover:underline">
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
        <span class="whitespace-nowrap text-muted tabular-nums">{{ formatDateTime(row.original.createdAt) }}</span>
      </template>
      <template #actions-cell="{ row }">
        <div class="text-right">
          <UButton :to="`/admin/transactions/${row.original.id}`" size="sm" color="neutral" variant="outline" icon="i-lucide-eye" label="Details" />
        </div>
      </template>
    </UTable>

    <AdminListFooter v-model:page="page" v-model:page-size="pageSize" :total="total" :range-text="rangeText" />
  </AdminPanel>
</template>
