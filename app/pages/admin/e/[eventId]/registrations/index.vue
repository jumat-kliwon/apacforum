<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { Component } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'admin', access: 'staff' })

const notify = useNotify()
const eventId = useEventId()
// exports are for superadmins only
const isSuperadmin = computed(() => useAdminRole().value === 'superadmin')
const list = useListQuery({
  sort: 'date',
  dir: 'desc',
  filters: { ticketTypeName: undefined, status: undefined, paymentStatus: undefined } as Record<'ticketTypeName' | 'status' | 'paymentStatus', string | undefined>
})
const { q, page, pageSize, filters, query, sortHeader } = list
const apiQuery = computed(() => ({ ...query.value, eventId }))

const { data, status, refresh } = await useFetch('/api/admin/participants', { query: apiQuery })
const tableSkeleton = useQuerySkeleton(status, apiQuery)
const { data: options } = await useFetch('/api/admin/event-options', { query: { eventId } })

// ── filters (applied with the "Apply" button) ──
const filterOpen = ref(Object.values(filters).some(Boolean))
const draft = reactive({ ...filters })
const ALL = '__all'
const withAll = (label: string, items: { label: string, value: string }[]) => [{ label, value: ALL }, ...items]
const typeItems = computed(() => withAll('All types', (options.value?.ticketTypeNames ?? []).map(n => ({ label: n, value: n }))))
const regItems = withAll('All statuses', toItems(REGISTRATION_STATUS))
const payItems = withAll('All statuses', toItems(PAYMENT_STATUS))
const pick = (key: keyof typeof draft) => computed({
  get: () => draft[key] ?? ALL,
  set: (v: string) => { draft[key] = v === ALL ? undefined : v }
})
const fType = pick('ticketTypeName')
const fReg = pick('status')
const fPay = pick('paymentStatus')
const activeFilters = computed(() => Object.values(filters).filter(Boolean).length)
const applyFilters = () => Object.assign(filters, draft)
function resetFilters() {
  for (const k of Object.keys(draft) as (keyof typeof draft)[]) draft[k] = undefined
  applyFilters()
}

// ── row selection ──
const selected = ref<Set<string>>(new Set())
const rows = computed(() => data.value?.rows ?? [])
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

// ── columns ──
type Row = (typeof rows.value)[number]
const UCheckbox = resolveComponent('UCheckbox') as Component
const columns = computed((): TableColumn<Row>[] => [
  {
    id: 'select',
    header: () => h(UCheckbox, { 'modelValue': allState.value, 'onUpdate:modelValue': toggleAll, 'aria-label': 'Select all participants on this page' }),
    enableHiding: false
  },
  { id: 'name', header: sortHeader('name', 'Participant'), enableHiding: false },
  { id: 'type', header: sortHeader('type', 'Participant type'), meta: { label: 'Participant type' } },
  { id: 'org', header: sortHeader('org', 'Organization'), meta: { label: 'Organization' } },
  { id: 'reg', header: sortHeader('reg', 'Registration status'), meta: { label: 'Registration status' } },
  { id: 'pay', header: sortHeader('pay', 'Payment status'), meta: { label: 'Payment status' } },
  { id: 'date', header: sortHeader('date', 'Registered'), meta: { label: 'Registered' } },
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

// ── bulk actions ──
const busy = ref(false)
const deleteOpen = ref(false)
async function bulk(action: 'verify' | 'email' | 'delete') {
  busy.value = true
  try {
    const res = await $fetch('/api/admin/participants/bulk', { method: 'POST', body: { action, ids: [...selected.value] } })
    const done = { verify: 'verified', email: 'emailed', delete: 'deleted' }[action]
    notify.success(`${res.affected} ${res.affected === 1 ? 'registration' : 'registrations'} ${done}`)
    selected.value = new Set()
    deleteOpen.value = false
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    busy.value = false
  }
}

const exportUrl = (ids?: string[]) => {
  const params = new URLSearchParams(Object.entries(apiQuery.value).map(([k, v]) => [k, String(v)]))
  if (ids?.length) params.set('ids', ids.join(','))
  return `/api/admin/exports/participants?${params}`
}

const total = computed(() => data.value?.total ?? 0)
const rangeText = computed(() => {
  if (!total.value) return 'No participants'
  const from = (page.value - 1) * pageSize.value + 1
  const to = Math.min(total.value, page.value * pageSize.value)
  return `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(total.value)} participants`
})
</script>

<template>
  <AdminPageHeader
    title="Manage participants"
    description="Everyone who registered through the registration form on the website."
    :breadcrumb="[{ label: 'Registrations' }, { label: 'Participants' }]"
  >
    <template v-if="isSuperadmin" #actions>
      <UButton :to="exportUrl()" external download color="neutral" variant="outline" icon="i-lucide-download" label="Export CSV" />
    </template>
  </AdminPageHeader>

  <AdminPanel>
    <div class="flex flex-wrap items-center gap-4 p-2">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Search name, email or organization" aria-label="Search name, email or organization" class="w-full sm:w-80 sm:min-w-[200px]" />
      <div class="ml-auto flex gap-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-list-filter"
          :label="activeFilters ? `Filters (${activeFilters})` : 'Filters'"
          :aria-expanded="filterOpen"
          aria-controls="participant-filters"
          @click="filterOpen = !filterOpen"
        />
        <UDropdownMenu :items="columnMenu" :content="{ align: 'end' }">
          <UButton color="neutral" variant="outline" icon="i-lucide-columns-3" label="Columns" />
        </UDropdownMenu>
      </div>
    </div>

    <div v-if="filterOpen" id="participant-filters" class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-end gap-4 rounded-md border border-default bg-muted p-4">
      <UFormField label="Participant type">
        <USelect v-model="fType" :items="typeItems" class="w-full" />
      </UFormField>
      <UFormField label="Registration status">
        <USelect v-model="fReg" :items="regItems" class="w-full" />
      </UFormField>
      <UFormField label="Payment status">
        <USelect v-model="fPay" :items="payItems" class="w-full" />
      </UFormField>
      <div class="flex items-end justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Reset" @click="resetFilters" />
        <UButton label="Apply" @click="applyFilters" />
      </div>
    </div>

    <div v-if="selected.size" role="region" aria-label="Bulk actions" class="flex flex-wrap items-center justify-between gap-4 rounded-md bg-brand-50 px-5 py-3 dark:bg-[#2e2a18]">
      <span aria-live="polite" class="text-sm font-semibold text-highlighted">{{ selected.size }} selected</span>
      <div class="ml-auto flex flex-wrap gap-2">
        <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-user-check" label="Verify" :loading="busy" @click="bulk('verify')" />
        <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-mail" label="Send email" :loading="busy" @click="bulk('email')" />
        <UButton v-if="isSuperadmin" size="sm" color="neutral" variant="outline" icon="i-lucide-download" label="Export" :to="exportUrl([...selected])" external download />
        <UButton size="sm" color="error" variant="soft" icon="i-lucide-trash-2" label="Delete" @click="deleteOpen = true" />
      </div>
    </div>

    <UTable
      v-model:column-visibility="columnVisibility"
      :data="tableSkeleton ? [] : rows"
      :columns="columns"
      :loading="status === 'pending'"
      :ui="{ loading: 'p-0' }"
      empty="No participants match these filters."
      class="-mx-4 sm:-mx-5"
    >
      <template #loading>
        <AdminSkeletonRows :rows="6" :columns="6" />
      </template>
      <template #select-cell="{ row }">
        <UCheckbox :model-value="selected.has(row.original.id)" :aria-label="`Select ${row.original.name}`" @update:model-value="toggleRow(row.original.id, $event)" />
      </template>
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar :text="initials(row.original.name)" size="sm" class="bg-brand-50 text-brand-900" />
          <div class="min-w-0">
            <NuxtLink :to="eventPath(eventId, 'registrations', row.original.userId)" class="font-semibold text-highlighted hover:underline">
              {{ row.original.name }}
            </NuxtLink>
            <div class="text-xs text-muted">{{ row.original.email }}</div>
          </div>
        </div>
      </template>
      <template #type-cell="{ row }">
        <UBadge color="neutral" variant="outline" :label="row.original.ticketTypeName" />
      </template>
      <template #org-cell="{ row }">
        <span class="text-muted">{{ row.original.organization ?? '—' }}</span>
      </template>
      <template #reg-cell="{ row }">
        <UBadge v-bind="REGISTRATION_STATUS[row.original.status]" />
      </template>
      <template #pay-cell="{ row }">
        <UBadge v-bind="paymentStatusLabel(row.original.paymentStatus, row.original.status)" />
      </template>
      <template #date-cell="{ row }">
        <span class="whitespace-nowrap text-muted tabular-nums">{{ formatDateTime(row.original.createdAt) }}</span>
      </template>
      <template #actions-cell="{ row }">
        <div class="text-right">
          <UButton :to="eventPath(eventId, 'registrations', row.original.userId)" size="sm" color="neutral" variant="outline" icon="i-lucide-eye" label="Details" />
        </div>
      </template>
    </UTable>

    <AdminListFooter v-model:page="page" v-model:page-size="pageSize" :total="total" :range-text="rangeText" />
  </AdminPanel>

  <AdminConfirmDialog
    v-model:open="deleteOpen"
    :title="`Delete ${selected.size} ${selected.size === 1 ? 'registration' : 'registrations'}?`"
    description="Their registration data and e-tickets are deleted too. Transaction history is kept for financial reporting. This cannot be undone."
    :confirm-label="`Delete ${selected.size} ${selected.size === 1 ? 'registration' : 'registrations'}`"
    :loading="busy"
    @confirm="bulk('delete')"
  />
</template>
