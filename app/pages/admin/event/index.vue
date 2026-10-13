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
  { id: 'date', header: sortHeader('date', 'Tanggal') },
  { id: 'place', header: sortHeader('place', 'Lokasi') },
  { id: 'count', header: sortHeader('count', 'Peserta') },
  { id: 'status', header: sortHeader('status', 'Status') },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Aksi') }
]

const ALL = '__all'
const statusFilter = computed({
  get: () => filters.status ?? ALL,
  set: (v: string) => { filters.status = v === ALL ? undefined : v }
})

// ── hapus ──
const target = ref<Row | null>(null)
const deleting = ref(false)
const impactText = (r: Row) => {
  const i = r.impact
  const parts = [
    i.days && `agenda ${i.days} hari`,
    i.speakers && `${i.speakers} speaker`,
    i.partners && `${i.partners} partner`,
    i.tickets && `${i.tickets} tipe tiket`
  ].filter(Boolean).join(', ')
  return `${parts ? `${parts[0]!.toUpperCase()}${parts.slice(1)} ikut terhapus. ` : ''}${i.participants ? `${formatNumber(i.participants)} pendaftaran dan e-tiketnya ikut terhapus; transaksi tetap tersimpan. ` : ''}Tindakan ini tidak bisa dibatalkan.`
}
async function remove() {
  if (!target.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/events/${target.value.id}`, { method: 'DELETE' })
    notify.success(`Event ${target.value.name} dihapus`)
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
  <AdminPageHeader title="Event" description="Setiap event punya info, agenda, speaker, partner, dan tiket sendiri.">
    <template #actions>
      <UButton to="/admin/event/baru" icon="i-lucide-plus" label="Tambah event" />
    </template>
  </AdminPageHeader>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-3">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Cari nama event" aria-label="Cari nama event" class="w-full sm:w-80" />
      <USelect v-model="statusFilter" :items="[{ label: 'Semua status', value: ALL }, ...toItems(EVENT_STATUS)]" icon="i-lucide-list-filter" aria-label="Filter status" class="ml-auto w-44" />
    </div>

    <UTable :data="data ?? []" :columns="columns" :loading="status === 'pending'" empty="Belum ada event." class="-mx-4 sm:-mx-5">
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-800"><UIcon name="i-lucide-calendar-days" class="size-5" /></span>
          <div class="min-w-0">
            <NuxtLink :to="`/admin/event/${row.original.id}`" class="font-semibold text-highlighted hover:underline">{{ row.original.name }}</NuxtLink>
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
          <UButton :to="`/admin/event/${row.original.id}`" size="sm" color="neutral" variant="outline" icon="i-lucide-eye" label="Lihat" />
          <UButton :to="`/admin/event/${row.original.id}/edit`" size="sm" color="neutral" variant="ghost" icon="i-lucide-pencil" :aria-label="`Edit ${row.original.name}`" />
          <UButton size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Hapus ${row.original.name}`" @click="target = row.original" />
        </div>
      </template>
    </UTable>
    <p class="text-sm text-muted" aria-live="polite">
      Menampilkan {{ data?.length ?? 0 }} event
    </p>
  </AdminPanel>

  <AdminConfirmDialog
    v-model:open="deleteOpen"
    :title="`Hapus event ${target?.name ?? ''}?`"
    :description="target ? impactText(target) : ''"
    confirm-label="Hapus event"
    :loading="deleting"
    @confirm="remove"
  />
</template>
