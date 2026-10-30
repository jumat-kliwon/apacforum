<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'events.manage' })

const route = useRoute()
const notify = useNotify()
const id = useEventId()
const { load } = useAdminEvents()
const { data, error, refresh } = await useFetch(`/api/admin/events/${id}`)

const ev = computed(() => data.value?.event)

// public ticket scanner for the registration desk; the link carries its own key, so no sign-in
const scannerOpen = ref(false)
const scannerUrl = computed(() => ev.value ? `${useRequestURL().origin}${ev.value.scannerPath}` : '')
async function copyScannerUrl() {
  await navigator.clipboard.writeText(scannerUrl.value)
  notify.success('Scanner link copied')
}
const stats = computed(() => {
  const d = data.value
  if (!d) return []
  return [
    { label: 'Registered participants', value: `${formatNumber(d.stats.participants)} / ${formatNumber(d.event.capacity)}`, icon: 'i-lucide-users' },
    { label: d.event.currency === 'IDR' ? 'Revenue' : 'Revenue (charged in IDR)', value: formatRupiah(d.stats.revenue), icon: 'i-lucide-wallet' },
    { label: 'Speakers', value: `${d.speakers.length} ${d.speakers.length === 1 ? 'person' : 'people'}`, icon: 'i-lucide-mic' },
    { label: 'Partners', value: `${d.partners.length} ${d.partners.length === 1 ? 'partner' : 'partners'}`, icon: 'i-lucide-handshake' }
  ]
})

const { rateOf } = useCurrencyRates()
const currencyInfo = computed(() => {
  const cur = ev.value?.currency ?? 'IDR'
  if (!isForeignCurrency(cur)) return 'IDR'
  const rate = rateOf(cur)
  return `${cur}, charged in IDR at ${rate ? formatRate(cur, rate) : 'a rate not set yet'}`
})

const info = computed(() => {
  const e = ev.value
  if (!e) return []
  return [
    ['Event name', e.name],
    ['Tagline', e.tagline],
    ['Dates', `${formatIsoDateWithDay(e.startDate).split(',')[0]}–${formatIsoDateWithDay(e.endDate)}`],
    ['Venue', [e.venueName, e.venueAddress, e.city].filter(Boolean).join(', ')],
    ['Capacity', `${formatNumber(e.capacity)} participants`],
    ['Ticket currency', currencyInfo.value],
    ['Registration deadline', `${formatDateTime(e.registrationDeadline)} WIB`],
    ['Event code', e.code],
    ['Slug', `/events/${e.slug}`],
    ['Description', e.description]
  ] as [string, string | null][]
})

const isOpen = computed(() => !!ev.value && ev.value.registrationOpen && new Date(ev.value.registrationDeadline) > new Date())

// the open tab lives in the URL so it survives a round trip to a participant
const router = useRouter()
const tab = computed({
  get: () => String(route.query.tab ?? 'overview'),
  set: (v: string) => router.replace({ query: { ...route.query, tab: v === 'overview' ? undefined : v } })
})
const tabs = computed(() => {
  const d = data.value
  const count = (n?: number) => (n ? formatNumber(n) : undefined)
  return [
    { label: 'Overview', value: 'overview', icon: 'i-lucide-info', slot: 'overview' as const },
    { label: 'Agenda', value: 'agenda', icon: 'i-lucide-calendar-days', badge: count(d?.agendaDays.length), slot: 'agenda' as const },
    { label: 'Tickets', value: 'tickets', icon: 'i-lucide-ticket', badge: count(d?.ticketTypes.length), slot: 'tickets' as const }
  ]
})

const deleteOpen = ref(false)
const deleting = ref(false)
const plural = (n: number, one: string, many: string) => `${formatNumber(n)} ${n === 1 ? one : many}`
const impactText = computed(() => {
  const i = data.value?.impact
  if (!i) return ''
  const parts = [
    i.days && `the ${plural(i.days, 'day', 'days')} agenda`,
    i.speakers && plural(i.speakers, 'speaker', 'speakers'),
    i.partners && plural(i.partners, 'partner', 'partners'),
    i.tickets && plural(i.tickets, 'ticket type', 'ticket types')
  ].filter(Boolean)
  const nested = parts.length ? `${parts.join(', ').replace(/^./, c => c.toUpperCase())} ${parts.length === 1 ? 'is' : 'are'} deleted too. ` : ''
  const people = i.participants ? `${plural(i.participants, 'participant loses their', 'participants lose their')} e-tickets. ` : ''
  return `${nested}${people}This cannot be undone.`
})
async function remove() {
  deleting.value = true
  try {
    await $fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
    notify.success('Event deleted')
    await load(true)
    await navigateTo('/admin/events')
  } catch (err) {
    notify.error(err)
    deleting.value = false
  }
}

// events with money on them are archived instead (the server refuses to delete them)
const locked = computed(() => (data.value?.impact.transactions ?? 0) > 0)
const archiving = ref(false)
// publishing needs a ticket type; the server checks it
const publishing = ref(false)
async function setStatus(next: 'draft' | 'published') {
  publishing.value = true
  try {
    await $fetch(`/api/admin/events/${id}/status`, { method: 'PUT', body: { status: next } })
    notify.success(next === 'published' ? 'Event published' : 'Event moved back to draft')
    await Promise.all([load(true), refresh()])
  } catch (err) {
    notify.error(err)
  } finally {
    publishing.value = false
  }
}

// the website's default event; the server clears the previous one
const savingDefault = ref(false)
async function setDefault(isDefault: boolean) {
  savingDefault.value = true
  try {
    await $fetch(`/api/admin/events/${id}/default`, { method: 'PUT', body: { isDefault } })
    notify.success(isDefault ? 'Set as the default event' : 'No longer the default event')
    await Promise.all([load(true), refresh()])
  } catch (err) {
    notify.error(err)
  } finally {
    savingDefault.value = false
  }
}

// Publish and Edit stay as buttons; everything else lives in the ⋯ menu.
const menu = computed<DropdownMenuItem[][]>(() => {
  const e = ev.value
  if (!e) return []
  return [
    [
      ...(e.status === 'published' ? [{ label: 'View on website', icon: 'i-lucide-external-link', to: `/events/${e.slug}`, target: '_blank' }] : []),
      { label: 'Ticket scanner', icon: 'i-lucide-scan-line', onSelect: () => { scannerOpen.value = true } }
    ],
    [
      ...(e.status !== 'archived' ? [{ label: 'Archive', icon: 'i-lucide-archive', onSelect: archive }] : []),
      locked.value
        ? { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, disabled: true, description: 'Has transactions: archive it instead' }
        : { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => { deleteOpen.value = true } }
    ]
  ]
})

async function archive() {
  archiving.value = true
  try {
    await $fetch(`/api/admin/events/${id}/archive`, { method: 'POST' })
    notify.success('Event archived', 'It is no longer on the website.')
    await Promise.all([load(true), refresh()])
  } catch (err) {
    notify.error(err)
  } finally {
    archiving.value = false
  }
}
</script>

<template>
  <div v-if="error" class="rounded-md border border-default bg-default p-10">
    <!-- only a 404 means the event is gone; anything else is a failure worth reading -->
    <UEmpty
      v-if="error.statusCode === 404"
      icon="i-lucide-calendar-x"
      title="Event not found"
      :actions="[{ label: 'Back to events', to: '/admin/events' }]"
    />
    <UEmpty
      v-else
      icon="i-lucide-triangle-alert"
      title="Could not load the event"
      :description="error.statusMessage || error.message"
      :actions="[{ label: 'Try again', onClick: () => refresh() }]"
    />
  </div>

  <template v-else-if="data && ev">
    <AdminPageHeader :title="ev.name" :breadcrumb="[{ label: 'Events', to: '/admin/events' }, { label: ev.name }]">
      <template #badges>
        <UBadge v-bind="EVENT_STATUS[ev.status]" />
        <UBadge :color="isOpen ? 'info' : 'neutral'" :label="isOpen ? 'Registration open' : 'Registration closed'" />
        <UBadge v-if="ev.isDefault" color="primary" variant="subtle" icon="i-lucide-star" label="Default" />
      </template>
      <template #description>
        {{ formatDateRange(ev.startDate, ev.endDate) }} · {{ ev.venueName }}, {{ ev.city }}
      </template>
      <template #actions>
        <UDropdownMenu :items="menu" :content="{ align: 'end' }">
          <UButton color="neutral" variant="outline" icon="i-lucide-ellipsis" aria-label="More actions" :loading="archiving" />
        </UDropdownMenu>
        <UButton v-if="ev.status === 'published'" color="neutral" variant="outline" icon="i-lucide-eye-off" label="Unpublish" :loading="publishing" @click="setStatus('draft')" />
        <UButton v-else color="neutral" variant="outline" icon="i-lucide-send" label="Publish" :loading="publishing" @click="setStatus('published')" />
        <UButton :to="eventPath(id, 'settings', 'edit')" icon="i-lucide-pencil" label="Edit event" />
      </template>
    </AdminPageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard v-for="s in stats" :key="s.label" v-bind="s" />
    </div>

    <UTabs v-model="tab" :items="tabs" variant="link" :unmount-on-hide="false" :ui="{ list: 'overflow-x-auto', content: 'pt-2' }">
      <template #overview>
        <AdminPanel class="mb-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-highlighted">
                Default event
              </p>
              <p class="text-[13px]/[18px] text-muted">
                {{ ev.status === 'archived'
                  ? 'Archived events cannot be the default.'
                  : 'The website\'s Register buttons use this event. Only one event can be the default; turning this on removes it from the current one.' }}
              </p>
            </div>
            <USwitch
              :model-value="ev.isDefault"
              aria-label="Default event"
              :loading="savingDefault"
              :disabled="savingDefault || (ev.status === 'archived' && !ev.isDefault)"
              @update:model-value="setDefault"
            />
          </div>
        </AdminPanel>

        <AdminPanel title="Details">
          <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
              <template v-for="[k, v] in info" :key="k">
                <dt class="text-muted">
                  {{ k }}
                </dt>
                <dd v-if="k === 'Description' && v" class="rich-text text-highlighted" v-html="descriptionToHtml(v)" />
                <dd v-else class="font-medium text-highlighted" :class="{ 'font-mono': k === 'Event code' || k === 'Slug' }">
                  {{ v || '—' }}
                </dd>
              </template>
            </dl>
            <div class="flex flex-col gap-2">
              <span class="text-sm font-medium">Event banner</span>
              <div class="flex aspect-video items-center justify-center overflow-hidden rounded-sm border border-default bg-muted">
                <img v-if="ev.bannerUrl" :src="ev.bannerUrl" :alt="`${ev.name} banner`" class="size-full object-cover">
                <span v-else class="text-sm text-muted">No banner yet</span>
              </div>
            </div>
          </div>
        </AdminPanel>

      </template>

      <template #agenda>
        <AdminPanel title="Agenda">
          <div class="grid gap-4 lg:grid-cols-3">
            <article v-for="(d, i) in data.agendaDays" :key="d.id" class="flex flex-col gap-2 rounded-sm border border-default p-4">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-sm font-semibold text-highlighted">
                  Day {{ i + 1 }}
                </h3>
                <UBadge color="primary" :label="d.label" />
              </div>
              <span class="text-[13px] text-muted">{{ formatIsoDateWithDay(d.date) }}</span>
              <p class="font-semibold text-highlighted">
                {{ d.theme }}
              </p>
              <p class="text-sm text-muted">
                {{ d.body }}
              </p>
            </article>
            <p v-if="!data.agendaDays.length" class="text-sm text-muted">
              No agenda yet.
            </p>
          </div>
        </AdminPanel>

      </template>

      <template #tickets>
        <AdminPanel title="Tickets">
          <template #actions>
            <UButton :to="eventPath(id, 'tickets')" color="neutral" variant="outline" size="sm" icon="i-lucide-ticket" label="Manage tickets" />
            <UButton :to="eventPath(id, 'tickets', 'new')" size="sm" icon="i-lucide-plus" label="Add ticket type" />
          </template>
          <UTable
            :data="data.ticketTypes"
            :columns="[{ id: 'name', header: 'Ticket type' }, { id: 'price', header: 'Price' }, { id: 'sold', header: 'Sold / quota' }, { id: 'status', header: 'Status' }]"
            empty="No ticket types yet."
            class="-mx-4 sm:-mx-5"
          >
            <template #name-cell="{ row }">
              <span class="font-semibold text-highlighted">{{ row.original.name }}</span>
              <span class="ml-2 font-mono text-xs text-muted">{{ row.original.code }}</span>
            </template>
            <template #price-cell="{ row }">
              <span class="tabular-nums">{{ formatMoney(row.original.price, data.event.currency) }}{{ row.original.paxPerTicket > 1 ? ` / ${row.original.paxPerTicket} people` : '' }}</span>
            </template>
            <template #sold-cell="{ row }">
              <div class="flex min-w-48 items-center gap-3">
                <UProgress :model-value="row.original.quota ? Math.min(100, (row.original.sold / row.original.quota) * 100) : 0" size="sm" :ui="{ indicator: 'bg-brand-400' }" :aria-label="`${row.original.sold} of ${row.original.quota} sold`" class="w-24" />
                <span class="tabular-nums">{{ formatNumber(row.original.sold) }} / {{ formatNumber(row.original.quota) }}</span>
              </div>
            </template>
            <template #status-cell="{ row }">
              <UBadge :color="row.original.isOnSale ? 'success' : 'neutral'" :label="row.original.isOnSale ? 'On sale' : 'Not on sale'" />
            </template>
          </UTable>
        </AdminPanel>
      </template>
    </UTabs>

    <AdminConfirmDialog
      v-model:open="deleteOpen"
      :title="`Delete ${ev.name}?`"
      :description="impactText"
      confirm-label="Delete event"
      :loading="deleting"
      @confirm="remove"
    />

    <UModal v-model:open="scannerOpen" title="Ticket scanner link" description="Share it with the registration desk crew. Anyone with this link can check tickets in for this event without signing in, so keep it private.">
      <template #body>
        <div class="flex gap-2">
          <UInput :model-value="scannerUrl" readonly aria-label="Scanner link" class="grow" :ui="{ base: 'font-mono text-xs' }" @focus="($event.target as HTMLInputElement).select()" />
          <UButton color="neutral" variant="outline" icon="i-lucide-copy" label="Copy" @click="copyScannerUrl" />
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" label="Close" @click="scannerOpen = false" />
          <UButton :to="scannerUrl" target="_blank" external icon="i-lucide-external-link" label="Open scanner" />
        </div>
      </template>
    </UModal>
  </template>
</template>
