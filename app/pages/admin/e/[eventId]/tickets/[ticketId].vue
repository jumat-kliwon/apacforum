<script setup lang="ts">
import type { TicketTypeForm, TicketTypeFormInput } from '~~/shared/schemas/event'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const eventId = useEventId()
const notify = useNotify()
const id = String(route.params.ticketId)
const { data, error } = await useFetch(`/api/admin/tickets/${id}`)
// a ticket type of another event is not found here
const missing = computed(() => !!error.value || (data.value && data.value.eventId !== eventId))

const initial = computed<TicketTypeFormInput | undefined>(() => {
  const t = data.value
  if (!t) return undefined
  return { eventId: t.eventId, code: t.code, name: t.name, price: t.price, paxPerTicket: t.paxPerTicket, quota: t.quota, isOnSale: t.isOnSale }
})

const saving = ref(false)
async function update(form: TicketTypeForm) {
  saving.value = true
  try {
    await $fetch(`/api/admin/tickets/${id}`, { method: 'PUT', body: form })
    notify.success('Ticket type saved')
    await navigateTo(eventPath(eventId, 'tickets'))
  } catch (err) {
    notify.error(err, 'Could not save the ticket type')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="missing" class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-ticket-x" title="Ticket type not found" :actions="[{ label: 'Back to tickets', to: eventPath(eventId, 'tickets') }]" />
  </div>
  <template v-else-if="data && initial">
    <AdminPageHeader :title="`Edit ${data.name}`" :breadcrumb="[{ label: 'Tickets', to: eventPath(eventId, 'tickets') }, { label: data.name }]">
      <template #badges>
        <UBadge :color="data.isOnSale ? 'success' : 'neutral'" :label="data.isOnSale ? 'On sale' : 'Not on sale'" />
      </template>
      <template #description>
        {{ formatNumber(data.sold) }} sold · {{ formatNumber(data.registered) }} active {{ data.registered === 1 ? 'registration' : 'registrations' }}
      </template>
    </AdminPageHeader>
    <AdminTicketForm :event-id="eventId" :initial="initial" :ticket-id="id" :sold="data.sold" :saving="saving" @submit="update" />
  </template>
</template>
