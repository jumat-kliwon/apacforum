<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { refDebounced } from '~/composables/useListQuery'

/** Participants tab on the event detail page: capacity, quick status filters and the list. */
type RegStatus = keyof typeof REGISTRATION_STATUS
type PayStatus = keyof typeof PAYMENT_STATUS
type Filter = { status?: RegStatus, paymentStatus?: PayStatus }
const props = defineProps<{
  eventId: string
  capacity: number
  registered: number
  breakdown: { status: RegStatus, paymentStatus: PayStatus, n: number }[]
}>()

// Quick filters over the two status columns, counted from the event's breakdown.
const SEGMENTS: { value: string, label: string, filter: Filter }[] = [
  { value: 'all', label: 'All', filter: {} },
  { value: 'pending', label: 'Pending verification', filter: { status: 'pending_verification' } },
  { value: 'awaiting', label: 'Awaiting payment', filter: { paymentStatus: 'pending' } },
  { value: 'paid', label: 'Paid', filter: { paymentStatus: 'paid' } },
  { value: 'rejected', label: 'Rejected', filter: { status: 'rejected' } }
]
const countFor = (f: Filter) => props.breakdown
  .filter(r => (!f.status || r.status === f.status) && (!f.paymentStatus || r.paymentStatus === f.paymentStatus))
  .reduce((sum, r) => sum + r.n, 0)
const segment = ref('all')
const segmentItems = computed(() => SEGMENTS.map(s => ({ label: s.label, value: s.value, badge: formatNumber(countFor(s.filter)) })))
const activeFilter = computed(() => SEGMENTS.find(s => s.value === segment.value)!.filter)

const q = ref('')
const debouncedQ = refDebounced(q, 300)
const page = ref(1)
const pageSize = ref(10)
watch([debouncedQ, segment, pageSize], () => { page.value = 1 })

const query = computed(() => ({
  eventId: props.eventId,
  page: page.value,
  pageSize: pageSize.value,
  sort: 'date',
  dir: 'desc',
  ...(debouncedQ.value ? { q: debouncedQ.value } : {}),
  ...activeFilter.value
}))
const { data, status } = await useFetch('/api/admin/participants', { query, lazy: true })
const rows = computed(() => data.value?.rows ?? [])
const total = computed(() => data.value?.total ?? 0)
const rangeText = computed(() => {
  if (!total.value) return 'No participants'
  const from = (page.value - 1) * pageSize.value + 1
  const to = Math.min(total.value, page.value * pageSize.value)
  return `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(total.value)} participants`
})
const exportUrl = computed(() => `/api/admin/exports/participants?${new URLSearchParams(Object.entries(query.value).map(([k, v]) => [k, String(v)]))}`)

const fill = computed(() => props.capacity ? Math.min(100, (props.registered / props.capacity) * 100) : 0)

type Row = (typeof rows.value)[number]
const columns: TableColumn<Row>[] = [
  { id: 'name', header: 'Participant' },
  { id: 'regNo', header: 'Registration no.' },
  { id: 'type', header: 'Participant type' },
  { id: 'reg', header: 'Registration status' },
  { id: 'pay', header: 'Payment status' },
  { id: 'date', header: 'Registered' }
]
</script>

<template>
  <div class="flex flex-col gap-4">
    <AdminPanel title="Capacity" :description="`${formatNumber(registered)} of ${formatNumber(capacity)} places taken, not counting rejected or cancelled registrations.`">
      <UProgress :model-value="fill" :ui="{ indicator: 'bg-brand-400' }" :aria-label="`${registered} of ${capacity} places taken`" />
    </AdminPanel>

    <AdminPanel>
      <div class="flex flex-col gap-4 p-2">
        <UTabs v-model="segment" :items="segmentItems" :content="false" variant="pill" size="md" class="overflow-x-auto" />
        <div class="flex flex-wrap items-center gap-3">
          <UInput v-model="q" icon="i-lucide-search" placeholder="Search name, email or organization" aria-label="Search participants" class="w-full sm:w-80" />
          <div class="ml-auto flex flex-wrap gap-2">
            <UButton :to="exportUrl" external download color="neutral" variant="outline" icon="i-lucide-download" label="Export CSV" />
            <UButton :to="{ path: '/admin/participants', query: { eventId } }" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-up-right" label="Open in Registrations" />
          </div>
        </div>
      </div>

      <UTable :data="rows" :columns="columns" :loading="status === 'pending'" class="-mx-4 sm:-mx-5">
        <template #name-cell="{ row }">
          <NuxtLink :to="`/admin/participants/${row.original.userId}`" class="flex items-center gap-3">
            <UAvatar :text="initials(row.original.name)" size="sm" class="bg-brand-50 text-brand-900" />
            <div class="min-w-0">
              <div class="font-medium text-highlighted">{{ row.original.name }}</div>
              <div class="text-xs text-muted">{{ row.original.organization || row.original.email }}</div>
            </div>
          </NuxtLink>
        </template>
        <template #regNo-cell="{ row }">
          <span class="font-mono text-xs">{{ row.original.regNo }}</span>
        </template>
        <template #type-cell="{ row }">
          <UBadge color="neutral" variant="outline" :label="row.original.ticketTypeName" />
        </template>
        <template #reg-cell="{ row }">
          <UBadge v-bind="REGISTRATION_STATUS[row.original.status]" />
        </template>
        <template #pay-cell="{ row }">
          <UBadge v-bind="paymentStatusLabel(row.original.paymentStatus, row.original.status)" />
        </template>
        <template #date-cell="{ row }">
          <span class="text-muted">{{ formatDateTime(row.original.createdAt) }}</span>
        </template>
        <template #empty>
          <UEmpty
            icon="i-lucide-users"
            :title="q || segment !== 'all' ? 'No participants match' : 'No registrations yet'"
            :description="q || segment !== 'all' ? 'Try another search or status.' : 'Registrations from the website show up here.'"
          />
        </template>
      </UTable>

      <AdminListFooter v-if="total" v-model:page="page" v-model:page-size="pageSize" :total="total" :range-text="rangeText" />
    </AdminPanel>
  </div>
</template>
