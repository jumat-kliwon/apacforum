<script setup lang="ts">
import type { PartnerForm } from '~~/shared/schemas/event'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const eventId = useEventId()
const notify = useNotify()
const { event } = useCurrentEvent()

const saving = ref(false)
async function create(form: PartnerForm) {
  saving.value = true
  try {
    await $fetch('/api/admin/partners', { method: 'POST', body: form })
    notify.success('Partner added')
    await navigateTo(eventPath(eventId, 'partners'))
  } catch (err) {
    notify.error(err, 'Could not save the partner')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminPageHeader
    title="Add partner"
    :description="`Partners appear by category on the ${event?.name ?? 'event'} page.`"
    :breadcrumb="[{ label: 'Partners', to: eventPath(eventId, 'partners') }, { label: 'Add partner' }]"
  />
  <AdminPartnerForm :event-id="eventId" :saving="saving" @submit="create" />
</template>
