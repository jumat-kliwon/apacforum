<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const notify = useNotify()
const list = useListQuery({ sort: 'date', dir: 'asc', filters: { status: undefined } as Record<'status', string | undefined> })
const { q, filters, sort, dir, sortHeader } = list
const query = computed(() => ({ q: list.query.value.q, status: filters.status, sort: sort.value, dir: dir.value }))
const { data, status, refresh } = await useFetch('/api/admin/events', { query, watch: [query] })

type Row = NonNullable<typeof data.value>[number]
const columns: TableColumn<Row>[] = [
  { id: 'name', header: sortHeader('name', 'Event') },
  { id: 'date', header: sortHeader('date', 'Dates') },
  { id: 'place', header: sortHeader('place', 'Venue') },
  { id: 'count', header: sortHeader('count', 'Participants') },
  { id: 'status', header: sortHeader('status', 'Status') },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Actions') }
]

const ALL = '__all'
const statusFilter = computed({
  get: () => filters.status ?? ALL,
  set: (v: string) => { filters.status = v === ALL ? undefined : v }
})

// ── delete ──
const target = ref<Row | null>(null)
const deleting = ref(false)
const plural = (n: number, one: string, many: string) => `${formatNumber(n)} ${n === 1 ? one : many}`
function impactText(r: Row) {
  const i = r.impact
  const parts = [
    i.days && `the ${plural(i.days, 'day', 'days')} agenda`,
    i.speakers && plural(i.speakers, 'speaker', 'speakers'),
    i.partners && plural(i.partners, 'partner', 'partners'),
    i.tickets && plural(i.tickets, 'ticket type', 'ticket types')
  ].filter(Boolean)
  const nested = parts.length ? `${parts.join(', ').replace(/^./, c => c.toUpperCase())} ${parts.length === 1 ? 'is' : 'are'} deleted too. ` : ''
  const people = i.participants ? `${plural(i.participants, 'registration and its', 'registrations and their')} e-tickets are deleted; transactions are kept. ` : ''
  return `${nested}${people}This cannot be undone.`
}
async function remove() {
  if (!target.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/events/${target.value.id}`, { method: 'DELETE' })
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
  <AdminPageHeader title="Events" description="Each event has its own details, agenda, speakers, partners and tickets.">
    <template #actions>
      <UButton to="/admin/events/new" icon="i-lucide-plus" label="Add event" />
    </template>
  </AdminPageHeader>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-4 p-2">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Search event name" aria-label="Search event name" class="w-full sm:w-80 sm:min-w-[200px]" />
      <USelect v-model="statusFilter" :items="[{ label: 'All statuses', value: ALL }, ...toItems(EVENT_STATUS)]" icon="i-lucide-list-filter" aria-label="Filter by status" class="ml-auto w-44" />
    </div>

    <UTable :data="data ?? []" :columns="columns" :loading="status === 'pending'" empty="No events yet." class="-mx-4 sm:-mx-5">
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-sm bg-brand-50 text-brand-800"><UIcon name="i-lucide-calendar-days" class="size-5" /></span>
          <div class="min-w-0">
            <NuxtLink :to="`/admin/events/${row.original.id}`" class="font-semibold text-highlighted hover:underline">{{ row.original.name }}</NuxtLink>
            <div class="max-w-xs truncate text-xs text-muted">{{ row.original.tagline }}</div>
          </div>
        </div>
      </template>
      <template #date-cell="{ row }">
        <span class="whitespace-nowrap">{{ formatDateRange(row.original.startDate, row.original.endDate) }}</span>
      </template>
      <template #place-cell="{ row }">
        {{ row.original.venueName }}, {{ row.original.city }}
      </template>
      <template #count-cell="{ row }">
        <span class="whitespace-nowrap tabular-nums">{{ formatNumber(row.original.participantCount) }} / {{ formatNumber(row.original.capacity) }}</span>
      </template>
      <template #status-cell="{ row }">
        <UBadge v-bind="EVENT_STATUS[row.original.status]" />
      </template>
      <template #actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UButton :to="`/admin/events/${row.original.id}`" size="sm" color="neutral" variant="outline" icon="i-lucide-eye" label="View" />
          <UButton :to="`/admin/events/${row.original.id}/edit`" size="sm" color="neutral" variant="ghost" icon="i-lucide-pencil" :aria-label="`Edit ${row.original.name}`" />
          <UButton size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Delete ${row.original.name}`" @click="target = row.original" />
        </div>
      </template>
    </UTable>
    <p class="text-sm text-muted" aria-live="polite">
      Showing {{ data?.length ?? 0 }} {{ data?.length === 1 ? 'event' : 'events' }}
    </p>
  </AdminPanel>

  <AdminConfirmDialog
    v-model:open="deleteOpen"
    :title="`Delete ${target?.name ?? ''}?`"
    :description="target ? impactText(target) : ''"
    confirm-label="Delete event"
    :loading="deleting"
    @confirm="remove"
  />
</template>
