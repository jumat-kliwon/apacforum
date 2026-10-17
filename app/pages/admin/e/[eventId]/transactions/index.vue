<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const eventId = useEventId()
const list = useListQuery({
  sort: 'date',
  dir: 'desc',
  filters: { status: undefined, method: undefined, from: undefined, to: undefined } as Record<'status' | 'method' | 'from' | 'to', string | undefined>
})
const { q, page, pageSize, filters, query, sortHeader } = list
const apiQuery = computed(() => ({ ...query.value, eventId }))

const { data, status, refresh } = await useFetch('/api/admin/transactions', { query: apiQuery })
const tableSkeleton = useQuerySkeleton(status, apiQuery)

// ── filters ──
const filterOpen = ref(Object.values(filters).some(Boolean))
const draft = reactive({ ...filters })
const ALL = '__all'
const withAll = (label: string, items: { label: string, value: string }[]) => [{ label, value: ALL }, ...items]
const statusItems = withAll('All statuses', toItems(TRANSACTION_STATUS))
const methodItems = withAll('All methods', toItems(PAYMENT_METHOD))
const pick = (key: 'status' | 'method') => computed({
  get: () => draft[key] ?? ALL,
  set: (v: string) => { draft[key] = v === ALL ? undefined : v }
})
const fStatus = pick('status')
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
const { ids: selectedIds, column: selectColumn } = useRowSelection(rows, { all: 'Select all transactions on this page', row: r => `Select ${r.invoiceNo}` })

const columns = computed<TableColumn<Row>[]>(() => [
  selectColumn,
  { id: 'id', header: sortHeader('id', 'Transaction ID'), enableHiding: false },
  { id: 'name', header: sortHeader('name', 'Participant'), meta: { label: 'Participant' } },
  { id: 'type', header: sortHeader('type', 'Ticket type'), meta: { label: 'Ticket type' } },
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
  const params = new URLSearchParams(Object.entries(apiQuery.value).map(([k, v]) => [k, String(v)]))
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

    <div v-if="filterOpen" id="transaction-filters" class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-end gap-4 rounded-md border border-default bg-muted p-4">
      <UFormField label="Status">
        <USelect v-model="fStatus" :items="statusItems" class="w-full" />
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

    <AdminBulkBar
      :ids="selectedIds"
      url="/api/admin/bulk-delete/transactions"
      :noun="['transaction', 'transactions']"
      description="Their invoices, payment details and status history are removed, paid ones included, so they leave the financial reports. Registrations are kept. A deleted pending invoice can still be paid through its DOKU link, and that payment will then not be recorded."
      @deleted="refresh()"
    >
      <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-download" label="Export" :to="exportUrl(selectedIds)" external download />
    </AdminBulkBar>

    <UTable v-model:column-visibility="columnVisibility" :data="tableSkeleton ? [] : rows" :columns="columns" :loading="status === 'pending'" :ui="{ loading: 'p-0' }" empty="No transactions match these filters." class="-mx-4 sm:-mx-5">
      <template #loading>
        <AdminSkeletonRows :rows="6" :columns="6" />
      </template>
      <template #id-cell="{ row }">
        <NuxtLink :to="eventPath(eventId, 'transactions', row.original.id)" class="font-mono text-[13px] font-medium text-primary hover:underline">
          {{ row.original.invoiceNo }}
        </NuxtLink>
      </template>
      <template #name-cell="{ row }">
        <NuxtLink v-if="row.original.userId" :to="eventPath(eventId, 'registrations', row.original.userId)" class="font-semibold text-highlighted hover:underline">
          {{ row.original.participantName }}
        </NuxtLink>
        <span v-else class="font-semibold text-highlighted">{{ row.original.participantName }}</span>
        <div class="text-xs text-muted">{{ row.original.participantEmail }}</div>
      </template>
      <template #type-cell="{ row }">
        <UBadge color="neutral" variant="outline" :label="row.original.ticketTypeName" />
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
          <UButton :to="eventPath(eventId, 'transactions', row.original.id)" size="sm" color="neutral" variant="outline" icon="i-lucide-eye" label="Details" />
        </div>
      </template>
    </UTable>

    <AdminListFooter v-model:page="page" v-model:page-size="pageSize" :total="total" :range-text="rangeText" />
  </AdminPanel>
</template>
