<script setup lang="ts">
import type { SpeakerForm, SpeakerFormInput } from '~~/shared/schemas/event'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const eventId = useEventId()
const notify = useNotify()
const id = String(route.params.speakerId)
const { data, error } = await useFetch(`/api/admin/speakers/${id}`)
// a speaker of another event is not found here
const missing = computed(() => !!error.value || (data.value && data.value.eventId !== eventId))

const initial = computed<SpeakerFormInput | undefined>(() => {
  const s = data.value
  if (!s) return undefined
  return { eventId: s.eventId, name: s.name, title: s.title, category: s.category, agendaDayId: s.agendaDayId, photoKey: s.photoKey, status: s.status }
})

const saving = ref(false)
async function update(form: SpeakerForm) {
  saving.value = true
  try {
    await $fetch(`/api/admin/speakers/${id}`, { method: 'PUT', body: form })
    notify.success('Speaker saved')
    await navigateTo(eventPath(eventId, 'speakers'))
  } catch (err) {
    notify.error(err, 'Could not save the speaker')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="missing" class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-mic-off" title="Speaker not found" :actions="[{ label: 'Back to speakers', to: eventPath(eventId, 'speakers') }]" />
  </div>
  <template v-else-if="data && initial">
    <AdminPageHeader :title="`Edit ${data.name}`" :breadcrumb="[{ label: 'Speakers', to: eventPath(eventId, 'speakers') }, { label: data.name }]">
      <template #badges>
        <UBadge color="neutral" variant="subtle" :label="SPEAKER_CATEGORY[data.category]" />
        <UBadge v-bind="PUBLISH_STATUS[data.status]" />
      </template>
    </AdminPageHeader>
    <AdminSpeakerForm :event-id="eventId" :initial="initial" :photo-url="data.photoUrl" :speaker-id="id" :saving="saving" @submit="update" />
  </template>
</template>
