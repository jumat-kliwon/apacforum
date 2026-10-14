<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { ticketsFormSchema, type TicketsFormInput } from '~~/shared/schemas/event'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const notify = useNotify()

const { data: options } = await useFetch('/api/admin/event-options')
const eventItems = computed(() => (options.value?.events ?? []).map(e => ({ label: e.name, value: e.id })))

// selected event, kept in `?event=` so links from other pages land on it
const eventId = computed({
  get: () => (typeof route.query.event === 'string' && route.query.event) || options.value?.events[0]?.id || '',
  set: (v: string) => router.replace({ query: { ...route.query, event: v } })
})

const { data, status, refresh } = await useFetch(() => `/api/admin/events/${eventId.value}/tickets`, {
  immediate: !!eventId.value,
  watch: [eventId]
})

type Row = NonNullable<typeof data.value>['ticketTypes'][number]
type Ticket = NonNullable<TicketsFormInput['ticketTypes']>[number] & { stats?: Pick<Row, 'sold' | 'registered' | 'used'> }

const blankTicket = (): Ticket => ({ code: '', name: '', price: 0, paxPerTicket: 1, quota: 0, isOnSale: true })
const state = reactive<{ ticketTypes: Ticket[] }>({ ticketTypes: [] })
function reset() {
  state.ticketTypes = (data.value?.ticketTypes ?? []).map(t => ({
    id: t.id, code: t.code, name: t.name, price: t.price, paxPerTicket: t.paxPerTicket, quota: t.quota, isOnSale: t.isOnSale,
    stats: { sold: t.sold, registered: t.registered, used: t.used }
  }))
}
watch(data, reset, { immediate: true })

const dirty = computed(() => {
  const strip = (list: Ticket[]) => JSON.stringify(list.map(({ stats: _, ...t }) => t))
  const saved = (data.value?.ticketTypes ?? []).map(t => ({
    id: t.id, code: t.code, name: t.name, price: t.price, paxPerTicket: t.paxPerTicket, quota: t.quota, isOnSale: t.isOnSale
  }))
  return strip(state.ticketTypes) !== JSON.stringify(saved)
})

const totals = computed(() => {
  const list = data.value?.ticketTypes ?? []
  return {
    types: list.length,
    quota: list.reduce((n, t) => n + t.quota, 0),
    sold: list.reduce((n, t) => n + t.sold, 0),
    revenue: list.reduce((n, t) => n + t.sold * t.price, 0)
  }
})
const stats = computed(() => [
  { label: 'Ticket types', value: formatNumber(totals.value.types), icon: 'i-lucide-ticket' },
  { label: 'Total quota', value: formatNumber(totals.value.quota), icon: 'i-lucide-users' },
  { label: 'Tickets sold', value: formatNumber(totals.value.sold), icon: 'i-lucide-badge-check' },
  { label: 'Ticket revenue', value: formatRupiah(totals.value.revenue), icon: 'i-lucide-wallet' }
])

const saving = ref(false)
async function save() {
  saving.value = true
  try {
    const body = { ticketTypes: state.ticketTypes.map(({ stats: _, ...t }) => t) }
    await $fetch(`/api/admin/events/${eventId.value}/tickets`, { method: 'PUT', body })
    notify.success('Tickets saved')
    await refresh()
  } catch (err) {
    notify.error(err, 'Could not save the tickets')
  } finally {
    saving.value = false
  }
}
function onError(e: FormErrorEvent) {
  const first = e.errors[0]
  if (first?.id) document.getElementById(first.id)?.focus()
}

const publishing = ref(false)
async function setStatus(next: 'draft' | 'published') {
  publishing.value = true
  try {
    await $fetch(`/api/admin/events/${eventId.value}/status`, { method: 'PUT', body: { status: next } })
    notify.success(next === 'published' ? 'Event published' : 'Event moved back to draft')
    await refresh()
  } catch (err) {
    notify.error(err)
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <AdminPageHeader title="Tickets" description="Ticket types become the participant types on the registration form. Pick an event to manage its tickets.">
    <template #actions>
      <USelect
        v-if="eventItems.length"
        v-model="eventId"
        :items="eventItems"
        icon="i-lucide-calendar-days"
        aria-label="Event"
        class="w-72"
      />
    </template>
  </AdminPageHeader>

  <div v-if="!eventItems.length" class="rounded-lg border border-default bg-default p-10">
    <UEmpty icon="i-lucide-ticket" title="No events yet" description="Create an event first, then add its ticket types here." :actions="[{ label: 'Add event', to: '/admin/events/new', icon: 'i-lucide-plus' }]" />
  </div>

  <template v-else-if="data">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard v-for="s in stats" :key="s.label" v-bind="s" />
    </div>

    <UAlert
      v-if="data.event.status !== 'published'"
      color="info"
      variant="subtle"
      icon="i-lucide-info"
      :title="`${data.event.name} is a draft`"
      :description="data.ticketTypes.length ? 'Its ticket types are ready. Publish the event to open it on the website.' : 'Add at least one ticket type and save, then publish the event.'"
      :actions="data.ticketTypes.length ? [{ label: 'Publish event', loading: publishing, onClick: () => setStatus('published') }] : []"
    />

    <UForm :schema="ticketsFormSchema" :state="state" class="flex flex-col gap-6" @submit="save" @error="onError">
      <AdminPanel :title="`Ticket types · ${data.event.name}`" description="A ticket type that already has registrations cannot be deleted. Turn off &quot;On sale&quot; instead.">
        <template #actions>
          <UButton :to="`/admin/events/${data.event.id}`" color="neutral" variant="ghost" icon="i-lucide-calendar-days" label="View event" />
          <UButton color="neutral" variant="outline" icon="i-lucide-plus" label="Add ticket type" @click="state.ticketTypes.push(blankTicket())" />
        </template>

        <div v-for="(t, i) in state.ticketTypes" :key="t.id ?? `new-${i}`" class="flex flex-col gap-3 rounded-md border border-default p-4">
          <div class="flex flex-wrap items-end gap-4">
            <div class="grid min-w-0 grow gap-4 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1.4fr_1fr_1fr]">
              <UFormField label="Ticket type name" :name="`ticketTypes.${i}.name`">
                <UInput v-model="t.name" placeholder="For example: Indonesia Delegate" class="w-full" />
              </UFormField>
              <UFormField label="Code" :name="`ticketTypes.${i}.code`">
                <UInput v-model="t.code" placeholder="ID" class="w-full font-mono uppercase" />
              </UFormField>
              <UFormField label="Price" :name="`ticketTypes.${i}.price`">
                <UInput v-model.number="t.price" type="number" min="0" class="w-full" :ui="{ base: 'ps-13' }">
                  <template #leading>
                    <span class="flex h-full items-center border-r border-default pr-2 text-sm font-medium text-toned">Rp</span>
                  </template>
                </UInput>
              </UFormField>
              <UFormField label="People per ticket" :name="`ticketTypes.${i}.paxPerTicket`">
                <UInput v-model.number="t.paxPerTicket" type="number" min="1" class="w-full" />
              </UFormField>
              <UFormField label="Quota" :name="`ticketTypes.${i}.quota`">
                <UInput v-model.number="t.quota" type="number" min="0" class="w-full" />
              </UFormField>
            </div>
            <div class="flex h-11 items-center gap-3">
              <USwitch v-model="t.isOnSale" label="On sale" />
              <UTooltip :text="t.stats?.used ? 'Has registrations — turn off On sale instead' : undefined" :disabled="!t.stats?.used">
                <UButton
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  :disabled="!!t.stats?.used"
                  :aria-label="`Remove ticket type ${t.name || i + 1}`"
                  @click="state.ticketTypes.splice(i, 1)"
                />
              </UTooltip>
            </div>
          </div>
          <div v-if="t.stats" class="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
            <div class="flex items-center gap-3">
              <UProgress :model-value="t.quota ? Math.min(100, (t.stats.sold / t.quota) * 100) : 0" size="sm" :ui="{ indicator: 'bg-brand-400' }" :aria-label="`${t.stats.sold} of ${t.quota} sold`" class="w-24" />
              <span class="tabular-nums">{{ formatNumber(t.stats.sold) }} / {{ formatNumber(t.quota) }} sold</span>
            </div>
            <span class="tabular-nums">{{ formatNumber(t.stats.registered) }} active {{ t.stats.registered === 1 ? 'registration' : 'registrations' }}</span>
          </div>
        </div>
        <p v-if="!state.ticketTypes.length" class="text-sm text-muted">
          No ticket types yet.
        </p>
      </AdminPanel>

      <div class="sticky bottom-0 z-10 -mx-4 -mb-10 flex flex-wrap items-center gap-3 border-t border-default bg-default px-4 py-4 sm:-mx-8 sm:px-8">
        <span class="flex items-center gap-2 text-[13px]/[18px] text-muted">
          <UIcon name="i-lucide-info" class="size-4" />
          {{ dirty ? 'You have unsaved changes.' : data.event.status === 'published' ? 'Changes show on the registration form right after you save.' : 'This event is not on the website yet.' }}
        </span>
        <div class="ml-auto flex flex-wrap gap-2">
          <UButton v-if="data.event.status === 'published'" color="neutral" variant="ghost" label="Unpublish event" :loading="publishing" @click="setStatus('draft')" />
          <UButton color="neutral" variant="outline" label="Discard changes" :disabled="!dirty || saving" @click="reset" />
          <UButton type="submit" label="Save tickets" :loading="saving" :disabled="!dirty" />
        </div>
      </div>
    </UForm>
  </template>

  <div v-else-if="status === 'pending'" class="flex justify-center p-10">
    <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
  </div>
</template>
