<script setup lang="ts">
import type { EventForm } from '~~/shared/schemas/event'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const notify = useNotify()
const saving = ref(false)

async function create(form: EventForm) {
  saving.value = true
  try {
    const { id } = await $fetch('/api/admin/events', { method: 'POST', body: form })
    notify.success(form.status === 'published' ? 'Event published' : 'Draft saved')
    await useAdminEvents().load(true)
    await navigateTo(eventPath(id, 'settings'))
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
    description="Five short steps. You can save the event as a draft at any step."
    :breadcrumb="[{ label: 'Manage events', to: '/admin/events' }, { label: 'Add event' }]"
  />
  <AdminEventForm :saving="saving" @submit="create" />
</template>
