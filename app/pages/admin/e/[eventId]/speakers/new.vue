<script setup lang="ts">
import type { SpeakerForm } from '~~/shared/schemas/event'

definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'events.manage' })

const eventId = useEventId()
const notify = useNotify()
const { event } = useCurrentEvent()

const saving = ref(false)
async function create(form: SpeakerForm) {
  saving.value = true
  try {
    await $fetch('/api/admin/speakers', { method: 'POST', body: form })
    notify.success('Speaker added')
    await navigateTo(eventPath(eventId, 'speakers'))
  } catch (err) {
    notify.error(err, 'Could not save the speaker')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminPageHeader
    title="Add speaker"
    :description="`Published speakers appear on the ${event?.name ?? 'event'} page.`"
    :breadcrumb="[{ label: 'Speakers', to: eventPath(eventId, 'speakers') }, { label: 'Add speaker' }]"
  />
  <AdminSpeakerForm :event-id="eventId" :saving="saving" @submit="create" />
</template>
