<script setup lang="ts">
import type { TicketTypeForm, TicketTypeFormInput } from '~~/shared/schemas/event'

definePageMeta({ layout: 'focus', middleware: 'admin', backTo: '/admin/tickets' })

const route = useRoute()
const notify = useNotify()
const id = String(route.params.id)
const [{ data, error }, { data: options }] = await Promise.all([
  useFetch(`/api/admin/tickets/${id}`),
  useFetch('/api/admin/event-options')
])

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
    await navigateTo(`/admin/tickets?eventId=${form.eventId}`)
  } catch (err) {
    notify.error(err, 'Could not save the ticket type')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="error" class="rounded-lg border border-default bg-default p-10">
    <UEmpty icon="i-lucide-ticket-x" title="Ticket type not found" :actions="[{ label: 'Back to tickets', to: '/admin/tickets' }]" />
  </div>
  <template v-else-if="data && initial">
    <AdminPageHeader :title="`Edit ${data.name}`">
      <template #badges>
        <UBadge :color="data.isOnSale ? 'success' : 'neutral'" :label="data.isOnSale ? 'On sale' : 'Not on sale'" />
      </template>
      <template #description>
        {{ data.eventName }} · {{ formatNumber(data.sold) }} sold · {{ formatNumber(data.registered) }} active {{ data.registered === 1 ? 'registration' : 'registrations' }}
      </template>
    </AdminPageHeader>
    <AdminTicketForm :initial="initial" :events="options?.events ?? []" :ticket-id="id" :sold="data.sold" :saving="saving" @submit="update" />
  </template>
</template>
