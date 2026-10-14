<script setup lang="ts">
import type { TicketTypeForm } from '~~/shared/schemas/event'

definePageMeta({ layout: 'focus', middleware: 'admin', backTo: '/admin/tickets' })

const route = useRoute()
const notify = useNotify()
const { data: options } = await useFetch('/api/admin/event-options')
const events = computed(() => options.value?.events ?? [])
const preset = typeof route.query.event === 'string' ? route.query.event : undefined

const saving = ref(false)
async function create(form: TicketTypeForm) {
  saving.value = true
  try {
    await $fetch('/api/admin/tickets', { method: 'POST', body: form })
    notify.success('Ticket type added')
    await navigateTo(`/admin/tickets?eventId=${form.eventId}`)
  } catch (err) {
    notify.error(err, 'Could not save the ticket type')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminPageHeader title="Add ticket type" description="Each ticket type is a participant type on the event's registration form." />
  <div v-if="!events.length" class="rounded-lg border border-default bg-default p-10">
    <UEmpty icon="i-lucide-calendar-x" title="No events yet" description="Create an event first, then add its ticket types." :actions="[{ label: 'Add event', to: '/admin/events/new', icon: 'i-lucide-plus' }]" />
  </div>
  <AdminTicketForm
    v-else
    :events="events"
    :initial="{ eventId: preset && events.some(e => e.id === preset) ? preset : events[0]!.id, code: '', name: '', price: 0, paxPerTicket: 1, quota: 0, isOnSale: true }"
    :saving="saving"
    @submit="create"
  />
</template>
