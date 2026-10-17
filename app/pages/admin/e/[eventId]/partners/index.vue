<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const eventId = useEventId()
const notify = useNotify()
const { event } = useCurrentEvent()
const list = useListQuery({
  sort: 'order',
  dir: 'asc',
  filters: { category: undefined, home: undefined } as Record<'category' | 'home', string | undefined>
})
const { q, page, pageSize, filters, query, sortHeader } = list
const apiQuery = computed(() => ({ ...query.value, eventId }))
const { data, status, refresh } = await useFetch('/api/admin/partners', { query: apiQuery })
const tableSkeleton = useQuerySkeleton(status, apiQuery)

const ALL = '__all'
const pick = (key: keyof typeof filters) => computed({
  get: () => filters[key] ?? ALL,
  set: (v: string) => { filters[key] = v === ALL ? undefined : v }
})
const categoryFilter = pick('category')
const homeFilter = pick('home')
const categoryItems = [{ label: 'All categories', value: ALL }, ...toItems(PARTNER_CATEGORY)]
const homeItems = [{ label: 'Home page: all', value: ALL }, { label: 'On home page', value: 'shown' }, { label: 'Not on home page', value: 'hidden' }]

type Row = NonNullable<typeof data.value>['rows'][number]
const rows = computed(() => data.value?.rows ?? [])
const { ids: selectedIds, column: selectColumn } = useRowSelection(rows, { all: 'Select all partners on this page', row: r => `Select ${r.name}` })
const columns: TableColumn<Row>[] = [
  selectColumn,
  { id: 'name', header: sortHeader('name', 'Partner') },
  { id: 'category', header: sortHeader('category', 'Category') },
  { id: 'home', header: sortHeader('home', 'Home page') },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Actions') }
]

const total = computed(() => data.value?.total ?? 0)
const rangeText = computed(() => {
  if (!total.value) return 'No partners'
  const from = (page.value - 1) * pageSize.value + 1
  const to = Math.min(total.value, page.value * pageSize.value)
  return `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(total.value)} partners`
})
const newHref = eventPath(eventId, 'partners', 'new')
const editHref = (id: string) => eventPath(eventId, 'partners', id)

// ── quick home-page toggle ──
const toggling = ref<string | null>(null)
async function toggleHome(r: Row, showHome: boolean) {
  toggling.value = r.id
  try {
    await $fetch(`/api/admin/partners/${r.id}`, {
      method: 'PUT',
      body: { eventId: r.eventId, name: r.name, category: r.category, logoKey: r.logoKey, showHome }
    })
    notify.success(`${r.name} is ${showHome ? 'on' : 'no longer on'} the home page`)
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
    await $fetch(`/api/admin/partners/${target.value.id}`, { method: 'DELETE' })
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
  <AdminPageHeader title="Partners" :description="`Partners appear by category on the ${event?.name ?? 'event'} page. Turn on Home page to also show one on the website's home page.`">
    <template #actions>
      <UButton :to="newHref" icon="i-lucide-plus" label="Add partner" />
    </template>
  </AdminPageHeader>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-4 p-2">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Search partner name" aria-label="Search partner name" class="w-full sm:w-80 sm:min-w-[200px]" />
      <div class="ml-auto flex flex-wrap gap-3">
        <USelect v-model="categoryFilter" :items="categoryItems" icon="i-lucide-list-filter" aria-label="Filter by category" class="w-64" />
        <USelect v-model="homeFilter" :items="homeItems" icon="i-lucide-house" aria-label="Filter by home page" class="w-52" />
      </div>
    </div>

    <AdminBulkBar
      :ids="selectedIds"
      url="/api/admin/bulk-delete/partners"
      :noun="['partner', 'partners']"
      :description="`They are removed from ${event?.name ?? 'the event'} and from the home page where shown, together with their logos.`"
      @deleted="refresh()"
    />

    <UTable :data="tableSkeleton ? [] : rows" :columns="columns" :loading="status === 'pending'" :ui="{ loading: 'p-0' }" empty="No partners yet." class="-mx-4 sm:-mx-5">
      <template #loading>
        <AdminSkeletonRows :rows="6" :columns="4" />
      </template>
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar :src="row.original.logoUrl ?? undefined" :text="initials(row.original.name)" :alt="row.original.name" size="lg" class="rounded-sm bg-muted text-highlighted" />
          <NuxtLink :to="editHref(row.original.id)" class="font-semibold text-highlighted hover:underline">{{ row.original.name }}</NuxtLink>
        </div>
      </template>
      <template #category-cell="{ row }">
        <span class="text-muted">{{ PARTNER_CATEGORY[row.original.category] }}</span>
      </template>
      <template #home-cell="{ row }">
        <USwitch
          :model-value="row.original.showHome"
          :label="row.original.showHome ? 'Shown' : 'Hidden'"
          :loading="toggling === row.original.id"
          :disabled="toggling === row.original.id"
          @update:model-value="v => toggleHome(row.original, v)"
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
    :description="`It is removed from ${event?.name ?? 'the event'}${target?.showHome ? ' and the home page' : ''}, together with its logo. This cannot be undone.`"
    confirm-label="Delete partner"
    :loading="deleting"
    @confirm="remove"
  />
</template>
