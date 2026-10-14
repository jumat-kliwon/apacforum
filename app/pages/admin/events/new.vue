<script setup lang="ts">
import type { EventForm } from '~~/shared/schemas/event'

definePageMeta({ layout: 'focus', middleware: 'admin', backTo: '/admin/events' })

const notify = useNotify()
const saving = ref(false)

async function create(form: EventForm) {
  saving.value = true
  try {
    const { id } = await $fetch('/api/admin/events', { method: 'POST', body: form })
    notify.success('Event created', 'Add its first ticket type, then publish the event.')
    await useAdminEvents().load(true)
    await navigateTo(eventPath(id, 'tickets', 'new'))
  } catch (err) {
    notify.error(err, 'Could not save the event')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminPageHeader
    title="Add event"
    description="Four short steps. Ticket types are added on the next page."
  />
  <AdminEventForm :saving="saving" @submit="create" />
</template>
