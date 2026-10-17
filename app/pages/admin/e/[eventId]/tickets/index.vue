<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin', access: 'staff' })

const eventId = useEventId()
const notify = useNotify()
const { event } = useCurrentEvent()
const list = useListQuery({
  sort: 'name',
  dir: 'asc',
  filters: { status: undefined } as Record<'status', string | undefined>
})
const { q, page, pageSize, filters, query, sortHeader } = list
const apiQuery = computed(() => ({ ...query.value, eventId }))
const { data, status, refresh } = await useFetch('/api/admin/tickets', { query: apiQuery })
const tableSkeleton = useQuerySkeleton(status, apiQuery)

const ALL = '__all'
const pick = (key: keyof typeof filters) => computed({
  get: () => filters[key] ?? ALL,
  set: (v: string) => { filters[key] = v === ALL ? undefined : v }
})
const statusFilter = pick('status')
const statusItems = [{ label: 'All statuses', value: ALL }, { label: 'On sale', value: 'on_sale' }, { label: 'Not on sale', value: 'off_sale' }]

type Row = NonNullable<typeof data.value>['rows'][number]
const rows = computed(() => data.value?.rows ?? [])
const { ids: selectedIds, column: selectColumn } = useRowSelection(rows, { all: 'Select all ticket types on this page', row: r => `Select ${r.name}` })
const columns: TableColumn<Row>[] = [
  selectColumn,
  { id: 'name', header: sortHeader('name', 'Ticket type') },
  { id: 'price', header: sortHeader('price', 'Price') },
  { id: 'sold', header: sortHeader('sold', 'Sold / quota') },
  { id: 'status', header: sortHeader('status', 'Status') },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Actions') }
]

const total = computed(() => data.value?.total ?? 0)
const rangeText = computed(() => {
  if (!total.value) return 'No ticket types'
  const from = (page.value - 1) * pageSize.value + 1
  const to = Math.min(total.value, page.value * pageSize.value)
  return `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(total.value)} ticket types`
})
const newHref = eventPath(eventId, 'tickets', 'new')
const editHref = (id: string) => eventPath(eventId, 'tickets', id)

// ── quick on-sale toggle ──
const toggling = ref<string | null>(null)
async function toggleSale(r: Row, isOnSale: boolean) {
  toggling.value = r.id
  try {
    await $fetch(`/api/admin/tickets/${r.id}`, {
      method: 'PUT',
      body: { eventId: r.eventId, code: r.code, name: r.name, price: r.price, paxPerTicket: r.paxPerTicket, quota: r.quota, isOnSale }
    })
    notify.success(`${r.name} is ${isOnSale ? 'on sale' : 'no longer on sale'}`)
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    toggling.value = null
  }
}

// ── delete ──
const target = ref<Row | null>(null)
const deleting = ref(false)
async function remove() {
  if (!target.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/tickets/${target.value.id}`, { method: 'DELETE' })
    notify.success(`${target.value.name} deleted`)
    target.value = null
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    deleting.value = false
  }
}
const deleteOpen = computed({ get: () => !!target.value, set: (v) => { if (!v) target.value = null } })
</script>

<template>
  <AdminPageHeader title="Tickets" :description="`Ticket types become the participant types on the ${event?.name ?? 'event'} registration form.`">
    <template #actions>
      <UButton :to="newHref" icon="i-lucide-plus" label="Add ticket type" />
    </template>
  </AdminPageHeader>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-4 p-2">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Search name or code" aria-label="Search name or code" class="w-full sm:w-80 sm:min-w-[200px]" />
      <div class="ml-auto flex flex-wrap gap-3">
        <USelect v-model="statusFilter" :items="statusItems" icon="i-lucide-list-filter" aria-label="Filter by status" class="w-44" />
      </div>
    </div>

    <AdminBulkBar
      :ids="selectedIds"
      url="/api/admin/bulk-delete/tickets"
      :noun="['ticket type', 'ticket types']"
      :description="`They are removed from the registration form of ${event?.name ?? 'the event'}. Ticket types that already have registrations are skipped.`"
      @deleted="refresh()"
    />

    <UTable :data="tableSkeleton ? [] : rows" :columns="columns" :loading="status === 'pending'" :ui="{ loading: 'p-0' }" empty="No ticket types yet." class="-mx-4 sm:-mx-5">
      <template #loading>
        <AdminSkeletonRows :rows="6" :columns="5" />
      </template>
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-sm bg-brand-50 text-brand-800"><UIcon name="i-lucide-ticket" class="size-5" /></span>
          <div class="min-w-0">
            <NuxtLink :to="editHref(row.original.id)" class="font-semibold text-highlighted hover:underline">{{ row.original.name }}</NuxtLink>
            <div class="font-mono text-xs text-muted">{{ row.original.code }}{{ row.original.paxPerTicket > 1 ? ` · ${row.original.paxPerTicket} people per ticket` : '' }}</div>
          </div>
        </div>
      </template>
      <template #price-cell="{ row }">
        <span class="whitespace-nowrap tabular-nums">{{ formatRupiah(row.original.price) }}</span>
      </template>
      <template #sold-cell="{ row }">
        <div class="flex min-w-40 flex-col gap-1">
          <div class="flex items-center gap-3">
            <UProgress :model-value="row.original.quota ? Math.min(100, (row.original.sold / row.original.quota) * 100) : 0" size="sm" :ui="{ indicator: 'bg-brand-400' }" :aria-label="`${row.original.sold} of ${row.original.quota} sold`" class="w-20" />
            <span class="whitespace-nowrap tabular-nums">{{ formatNumber(row.original.sold) }} / {{ formatNumber(row.original.quota) }}</span>
          </div>
          <span class="text-xs text-muted tabular-nums">{{ formatNumber(row.original.registered) }} active {{ row.original.registered === 1 ? 'registration' : 'registrations' }}</span>
        </div>
      </template>
      <template #status-cell="{ row }">
        <USwitch
          :model-value="row.original.isOnSale"
          :label="row.original.isOnSale ? 'On sale' : 'Not on sale'"
          :loading="toggling === row.original.id"
          :disabled="toggling === row.original.id"
          @update:model-value="v => toggleSale(row.original, v)"
        />
      </template>
      <template #actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UButton :to="editHref(row.original.id)" size="sm" color="neutral" variant="outline" icon="i-lucide-pencil" :aria-label="`Edit ${row.original.name}`" />
          <UTooltip :text="row.original.used ? 'Has registrations — turn off On sale instead' : undefined" :disabled="!row.original.used">
            <UButton size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" :disabled="!!row.original.used" :aria-label="`Delete ${row.original.name}`" @click="target = row.original" />
          </UTooltip>
        </div>
      </template>
    </UTable>

    <AdminListFooter v-model:page="page" v-model:page-size="pageSize" :total="total" :range-text="rangeText" />
  </AdminPanel>

  <AdminConfirmDialog
    v-model:open="deleteOpen"
    :title="`Delete ${target?.name ?? ''}?`"
    :description="`It is removed from the registration form of ${event?.name ?? 'the event'}. This cannot be undone.`"
    confirm-label="Delete ticket type"
    :loading="deleting"
    @confirm="remove"
  />
</template>
