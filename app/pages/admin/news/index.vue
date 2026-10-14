<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const notify = useNotify()
const list = useListQuery({ sort: 'updated', dir: 'desc', filters: { status: undefined } as Record<'status', string | undefined> })
const { q, page, pageSize, filters, query, sortHeader } = list
const { data, status, refresh } = await useFetch('/api/admin/articles', { query, watch: [query] })
const tableSkeleton = useQuerySkeleton(status, query)

type Row = NonNullable<typeof data.value>['rows'][number]
const columns: TableColumn<Row>[] = [
  { id: 'title', header: sortHeader('title', 'Article') },
  { id: 'status', header: sortHeader('status', 'Status') },
  { id: 'published', header: sortHeader('published', 'Published') },
  { id: 'updated', header: sortHeader('updated', 'Last updated') },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Actions') }
]

const ALL = '__all'
const statusFilter = computed({
  get: () => filters.status ?? ALL,
  set: (v: string) => { filters.status = v === ALL ? undefined : v }
})

const total = computed(() => data.value?.total ?? 0)
const rangeText = computed(() => {
  if (!total.value) return 'No articles'
  const from = (page.value - 1) * pageSize.value + 1
  const to = Math.min(total.value, page.value * pageSize.value)
  return `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(total.value)} articles`
})

const isScheduled = (r: Row) => r.status === 'published' && !!r.publishedAt && new Date(r.publishedAt) > new Date()

// ── delete ──
const target = ref<Row | null>(null)
const deleting = ref(false)
async function remove() {
  if (!target.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/articles/${target.value.id}`, { method: 'DELETE' })
    notify.success('Article deleted')
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
  <AdminPageHeader title="News & Media" description="Articles, press releases and media coverage shown on the News page of the website.">
    <template #actions>
      <UButton to="/news" target="_blank" color="neutral" variant="outline" icon="i-lucide-external-link" label="View News page" />
      <UButton to="/admin/news/new" icon="i-lucide-plus" label="Write article" />
    </template>
  </AdminPageHeader>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-4 p-2">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Search title" aria-label="Search title" class="w-full sm:w-80 sm:min-w-[200px]" />
      <USelect v-model="statusFilter" :items="[{ label: 'All statuses', value: ALL }, ...toItems(PUBLISH_STATUS)]" icon="i-lucide-list-filter" aria-label="Filter by status" class="ml-auto w-44" />
    </div>

    <UTable :data="tableSkeleton ? [] : data?.rows ?? []" :columns="columns" :loading="status === 'pending'" :ui="{ loading: 'p-0' }" empty="No articles yet." class="-mx-4 sm:-mx-5">
      <template #loading>
        <AdminSkeletonRows :rows="6" :columns="4" />
      </template>
      <template #title-cell="{ row }">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-brand-50 text-brand-800">
            <img v-if="row.original.thumbnailUrl" :src="row.original.thumbnailUrl" alt="" class="size-full object-cover">
            <UIcon v-else name="i-lucide-newspaper" class="size-5" />
          </div>
          <div class="min-w-0">
            <NuxtLink :to="`/admin/news/${row.original.id}`" class="line-clamp-1 max-w-md font-semibold text-highlighted hover:underline">{{ row.original.title }}</NuxtLink>
            <div class="max-w-md truncate font-mono text-xs text-muted">/news/{{ row.original.slug }}</div>
          </div>
        </div>
      </template>
      <template #status-cell="{ row }">
        <UBadge v-if="isScheduled(row.original)" color="info" label="Scheduled" />
        <UBadge v-else v-bind="PUBLISH_STATUS[row.original.status]" />
      </template>
      <template #published-cell="{ row }">
        <span class="whitespace-nowrap">{{ row.original.publishedAt ? formatDateTime(row.original.publishedAt) : '—' }}</span>
      </template>
      <template #updated-cell="{ row }">
        <div class="whitespace-nowrap">
          {{ formatDateTime(row.original.updatedAt) }}
        </div>
        <div class="text-xs text-muted">
          Created {{ formatDate(row.original.createdAt, 'short') }}{{ row.original.authorName ? ` by ${row.original.authorName}` : '' }}
        </div>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UButton v-if="row.original.status === 'published' && !isScheduled(row.original)" :to="`/news/${row.original.slug}`" target="_blank" size="sm" color="neutral" variant="ghost" icon="i-lucide-external-link" :aria-label="`View ${row.original.title} on the website`" />
          <UButton :to="`/admin/news/${row.original.id}`" size="sm" color="neutral" variant="outline" icon="i-lucide-pencil" :aria-label="`Edit ${row.original.title}`" />
          <UButton size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Delete ${row.original.title}`" @click="target = row.original" />
        </div>
      </template>
    </UTable>

    <AdminListFooter v-model:page="page" v-model:page-size="pageSize" :total="total" :range-text="rangeText" />
  </AdminPanel>

  <AdminConfirmDialog
    v-model:open="deleteOpen"
    :title="`Delete “${target?.title ?? ''}”?`"
    description="The article and its images are removed from the website. This cannot be undone."
    confirm-label="Delete article"
    :loading="deleting"
    @confirm="remove"
  />
</template>
