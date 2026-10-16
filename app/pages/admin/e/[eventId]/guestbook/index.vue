<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const eventId = useEventId()
const notify = useNotify()
const { event } = useCurrentEvent()
const list = useListQuery({
  sort: 'date',
  dir: 'desc',
  filters: { topic: undefined } as Record<'topic', string | undefined>
})
const { q, page, pageSize, filters, query, sortHeader } = list
const apiQuery = computed(() => ({ ...query.value, eventId }))
const { data, status, refresh } = await useFetch('/api/admin/guestbook', { query: apiQuery })
const tableSkeleton = useQuerySkeleton(status, apiQuery)

const ALL = '__all'
const topicFilter = computed({
  get: () => filters.topic ?? ALL,
  set: (v: string) => { filters.topic = v === ALL ? undefined : v }
})
const topicItems = computed(() => [
  { label: 'All topics', value: ALL },
  ...(data.value?.topics ?? []).map(t => ({ label: t, value: t }))
])

type Row = NonNullable<typeof data.value>['rows'][number]
const columns: TableColumn<Row>[] = [
  { id: 'name', header: sortHeader('name', 'Guest') },
  { id: 'institution', header: 'Institution' },
  { id: 'country', header: sortHeader('country', 'Country') },
  { id: 'message', header: 'Message' },
  { id: 'date', header: sortHeader('date', 'Submitted') },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Actions') }
]

const total = computed(() => data.value?.total ?? 0)
const rangeText = computed(() => {
  if (!total.value) return 'No entries'
  const from = (page.value - 1) * pageSize.value + 1
  const to = Math.min(total.value, page.value * pageSize.value)
  return `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(total.value)} entries`
})
// the export follows the search and filter on screen, not the page
const exportUrl = computed(() => {
  const params = new URLSearchParams(Object.entries(apiQuery.value).map(([k, v]) => [k, String(v)]))
  params.delete('page')
  params.delete('pageSize')
  return `/api/admin/exports/guestbook?${params}`
})

// ── read a message ──
const viewing = ref<Row | null>(null)
const viewOpen = computed({ get: () => !!viewing.value, set: (v) => { if (!v) viewing.value = null } })

// ── delete ──
const target = ref<Row | null>(null)
const deleting = ref(false)
async function remove() {
  if (!target.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/guestbook/${target.value.id}`, { method: 'DELETE' })
    notify.success(`Entry from ${target.value.name} deleted`)
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
  <AdminPageHeader title="Guestbook" :description="`Messages left through the website's contact form while ${event?.name ?? 'this event'} was the featured event.`">
    <template #actions>
      <UButton :to="exportUrl" external download color="neutral" variant="outline" icon="i-lucide-download" label="Export CSV" :disabled="!total" />
    </template>
  </AdminPageHeader>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-4 p-2">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Search name, email or institution" aria-label="Search name, email or institution" class="w-full sm:w-80 sm:min-w-[200px]" />
      <div class="ml-auto flex flex-wrap gap-3">
        <USelect v-model="topicFilter" :items="topicItems" icon="i-lucide-list-filter" aria-label="Filter by topic" class="w-64" />
      </div>
    </div>

    <UTable :data="tableSkeleton ? [] : data?.rows ?? []" :columns="columns" :loading="status === 'pending'" :ui="{ loading: 'p-0' }" empty="No guestbook entries yet." class="-mx-4 sm:-mx-5">
      <template #loading>
        <AdminSkeletonRows :rows="6" :columns="6" />
      </template>
      <template #name-cell="{ row }">
        <div class="flex min-w-0 flex-col">
          <span class="font-semibold text-highlighted">{{ row.original.name }}</span>
          <a :href="`mailto:${row.original.email}`" class="truncate text-muted hover:underline">{{ row.original.email }}</a>
        </div>
      </template>
      <template #institution-cell="{ row }">
        <div class="flex min-w-0 flex-col">
          <span class="text-toned">{{ row.original.institution ?? '—' }}</span>
          <span v-if="row.original.position" class="text-muted">{{ row.original.position }}</span>
        </div>
      </template>
      <template #country-cell="{ row }">
        <span class="text-muted">{{ row.original.country ?? '—' }}</span>
      </template>
      <template #message-cell="{ row }">
        <div class="flex max-w-80 flex-col gap-1">
          <UBadge v-if="row.original.topic" :label="row.original.topic" color="neutral" variant="subtle" class="self-start" />
          <button v-if="row.original.message" type="button" class="line-clamp-2 text-left text-toned hover:underline" @click="viewing = row.original">
            {{ row.original.message }}
          </button>
          <span v-else-if="!row.original.topic" class="text-muted">—</span>
        </div>
      </template>
      <template #date-cell="{ row }">
        <span class="whitespace-nowrap text-muted">{{ formatDateTime(row.original.createdAt) }}</span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-eye" :aria-label="`Read the entry from ${row.original.name}`" @click="viewing = row.original" />
          <UButton size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Delete the entry from ${row.original.name}`" @click="target = row.original" />
        </div>
      </template>
    </UTable>

    <AdminListFooter v-model:page="page" v-model:page-size="pageSize" :total="total" :range-text="rangeText" />
  </AdminPanel>

  <UModal v-model:open="viewOpen" :title="viewing?.name ?? ''" :description="viewing ? formatDateTime(viewing.createdAt) : ''">
    <template #body>
      <dl v-if="viewing" class="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-sm">
        <dt class="text-muted">
          Email
        </dt>
        <dd><a :href="`mailto:${viewing.email}`" class="text-highlighted hover:underline">{{ viewing.email }}</a></dd>
        <template v-for="[label, value] in [['Institution', viewing.institution], ['Position', viewing.position], ['Country', viewing.country], ['Topic', viewing.topic]]" :key="label">
          <dt class="text-muted">
            {{ label }}
          </dt>
          <dd class="text-highlighted">
            {{ value ?? '—' }}
          </dd>
        </template>
        <dt class="text-muted">
          Message
        </dt>
        <dd class="whitespace-pre-line text-highlighted">
          {{ viewing.message || '—' }}
        </dd>
      </dl>
    </template>
  </UModal>

  <AdminConfirmDialog
    v-model:open="deleteOpen"
    :title="`Delete the entry from ${target?.name ?? ''}?`"
    description="It is removed from the guestbook. This cannot be undone."
    confirm-label="Delete entry"
    :loading="deleting"
    @confirm="remove"
  />
</template>
