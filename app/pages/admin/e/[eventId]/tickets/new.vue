<script setup lang="ts">
import type { TicketTypeForm } from '~~/shared/schemas/event'

definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'events.manage' })

const eventId = useEventId()
const notify = useNotify()
const { event } = useCurrentEvent()

const saving = ref(false)
async function create(form: TicketTypeForm) {
  saving.value = true
  try {
    await $fetch('/api/admin/tickets', { method: 'POST', body: form })
    notify.success('Ticket type added')
    await navigateTo(eventPath(eventId, 'tickets'))
  } catch (err) {
    notify.error(err, 'Could not save the ticket type')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminPageHeader
    title="Add ticket type"
    :description="`Each ticket type is a participant type on the ${event?.name ?? 'event'} registration form.`"
    :breadcrumb="[{ label: 'Tickets', to: eventPath(eventId, 'tickets') }, { label: 'Add ticket type' }]"
  />
  <AdminTicketForm :event-id="eventId" :saving="saving" @submit="create" />
</template>
