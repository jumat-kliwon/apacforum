<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const eventId = useEventId()
const notify = useNotify()
const { event } = useCurrentEvent()
const list = useListQuery({
  sort: 'order',
  dir: 'asc',
  filters: { category: undefined, status: undefined } as Record<'category' | 'status', string | undefined>
})
const { q, page, pageSize, filters, query, sortHeader } = list
const apiQuery = computed(() => ({ ...query.value, eventId }))
const { data, status, refresh } = await useFetch('/api/admin/speakers', { query: apiQuery })
const tableSkeleton = useQuerySkeleton(status, apiQuery)

const ALL = '__all'
const pick = (key: keyof typeof filters) => computed({
  get: () => filters[key] ?? ALL,
  set: (v: string) => { filters[key] = v === ALL ? undefined : v }
})
const categoryFilter = pick('category')
const statusFilter = pick('status')
const categoryItems = [{ label: 'All categories', value: ALL }, ...toItems(SPEAKER_CATEGORY)]
const statusItems = [{ label: 'All statuses', value: ALL }, { label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }]

type Row = NonNullable<typeof data.value>['rows'][number]
const rows = computed(() => data.value?.rows ?? [])
const { ids: selectedIds, column: selectColumn } = useRowSelection(rows, { all: 'Select all speakers on this page', row: r => `Select ${r.name}` })
const columns: TableColumn<Row>[] = [
  selectColumn,
  { id: 'name', header: sortHeader('name', 'Speaker') },
  { id: 'category', header: sortHeader('category', 'Category') },
  { id: 'session', header: sortHeader('session', 'Session') },
  { id: 'status', header: sortHeader('status', 'Published') },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Actions') }
]

const total = computed(() => data.value?.total ?? 0)
const rangeText = computed(() => {
  if (!total.value) return 'No speakers'
  const from = (page.value - 1) * pageSize.value + 1
  const to = Math.min(total.value, page.value * pageSize.value)
  return `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(total.value)} speakers`
})
const newHref = eventPath(eventId, 'speakers', 'new')
const editHref = (id: string) => eventPath(eventId, 'speakers', id)

// ── quick publish toggle ──
const toggling = ref<string | null>(null)
async function togglePublished(r: Row, published: boolean) {
  toggling.value = r.id
  try {
    await $fetch(`/api/admin/speakers/${r.id}`, {
      method: 'PUT',
      body: { eventId: r.eventId, name: r.name, title: r.title, category: r.category, agendaDayId: r.agendaDayId, photoKey: r.photoKey, status: published ? 'published' : 'draft' }
    })
    notify.success(`${r.name} is ${published ? 'now' : 'no longer'} on the website`)
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
    await $fetch(`/api/admin/speakers/${target.value.id}`, { method: 'DELETE' })
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
  <AdminPageHeader title="Speakers" :description="`Published speakers appear on the ${event?.name ?? 'event'} page. Drafts stay hidden.`">
    <template #actions>
      <UButton :to="newHref" icon="i-lucide-plus" label="Add speaker" />
    </template>
  </AdminPageHeader>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-4 p-2">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Search name or institution" aria-label="Search name or institution" class="w-full sm:w-80 sm:min-w-[200px]" />
      <div class="ml-auto flex flex-wrap gap-3">
        <USelect v-model="categoryFilter" :items="categoryItems" icon="i-lucide-list-filter" aria-label="Filter by category" class="w-52" />
        <USelect v-model="statusFilter" :items="statusItems" icon="i-lucide-eye" aria-label="Filter by status" class="w-44" />
      </div>
    </div>

    <AdminBulkBar
      :ids="selectedIds"
      url="/api/admin/bulk-delete/speakers"
      :noun="['speaker', 'speakers']"
      :description="`They are removed from ${event?.name ?? 'the event'}, together with their photos.`"
      @deleted="refresh()"
    />

    <UTable :data="tableSkeleton ? [] : rows" :columns="columns" :loading="status === 'pending'" :ui="{ loading: 'p-0' }" empty="No speakers yet." class="-mx-4 sm:-mx-5">
      <template #loading>
        <AdminSkeletonRows :rows="6" :columns="5" />
      </template>
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar :src="row.original.photoUrl ?? undefined" :text="initials(row.original.name)" :alt="row.original.name" size="lg" class="bg-brand-50 text-brand-900" />
          <div class="min-w-0">
            <NuxtLink :to="editHref(row.original.id)" class="font-semibold text-highlighted hover:underline">{{ row.original.name }}</NuxtLink>
            <div class="truncate text-xs text-muted">{{ row.original.title }}</div>
          </div>
        </div>
      </template>
      <template #category-cell="{ row }">
        <span class="text-muted">{{ SPEAKER_CATEGORY[row.original.category] }}</span>
      </template>
      <template #session-cell="{ row }">
        <span class="text-muted">{{ row.original.dayNumber != null ? `Day ${row.original.dayNumber} · ${row.original.dayLabel}` : '—' }}</span>
      </template>
      <template #status-cell="{ row }">
        <USwitch
          :model-value="row.original.status === 'published'"
          :label="row.original.status === 'published' ? 'Published' : 'Draft'"
          :loading="toggling === row.original.id"
          :disabled="toggling === row.original.id"
          @update:model-value="v => togglePublished(row.original, v)"
        />
      </template>
      <template #actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UButton :to="editHref(row.original.id)" size="sm" color="neutral" variant="outline" icon="i-lucide-pencil" :aria-label="`Edit ${row.original.name}`" />
          <UButton size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Delete ${row.original.name}`" @click="target = row.original" />
        </div>
      </template>
    </UTable>

    <AdminListFooter v-model:page="page" v-model:page-size="pageSize" :total="total" :range-text="rangeText" />
  </AdminPanel>

  <AdminConfirmDialog
    v-model:open="deleteOpen"
    :title="`Delete ${target?.name ?? ''}?`"
    :description="`It is removed from ${event?.name ?? 'the event'}, together with its photo. This cannot be undone.`"
    confirm-label="Delete speaker"
    :loading="deleting"
    @confirm="remove"
  />
</template>
