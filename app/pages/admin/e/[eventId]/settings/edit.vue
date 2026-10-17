<script setup lang="ts">
import type { EventForm, EventFormInput } from '~~/shared/schemas/event'

definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'events.manage' })

const notify = useNotify()
const id = useEventId()
const { data, error } = await useFetch(`/api/admin/events/${id}`)

const initial = computed<EventFormInput | undefined>(() => {
  const d = data.value
  if (!d) return undefined
  const e = d.event
  return {
    name: e.name, code: e.code, slug: e.slug, tagline: e.tagline ?? '', description: e.description,
    startDate: e.startDate, endDate: e.endDate, registrationDeadline: e.registrationDeadlineDate,
    venueName: e.venueName, venueAddress: e.venueAddress ?? '', city: e.city, capacity: e.capacity,
    bannerKey: e.bannerKey, registrationOpen: e.registrationOpen, status: e.status === 'published' ? 'published' : 'draft',
    agendaDays: d.agendaDays.map(a => ({ id: a.id, label: a.label, date: a.date, theme: a.theme, body: a.body })),
    speakers: d.speakers.map(s => ({ id: s.id, name: s.name, title: s.title, category: s.category, agendaDayIndex: s.agendaDayIndex != null && s.agendaDayIndex >= 0 ? s.agendaDayIndex : null, photoKey: s.photoKey, status: s.status })),
    partners: d.partners.map(p => ({ id: p.id, name: p.name, category: p.category, logoKey: p.logoKey }))
  }
})
const previews = computed(() => data.value && {
  banner: data.value.event.bannerUrl,
  speakers: data.value.speakers.map(s => s.photoUrl),
  partners: data.value.partners.map(p => p.logoUrl)
})

const saving = ref(false)
async function update(form: EventForm) {
  saving.value = true
  try {
    await $fetch(`/api/admin/events/${id}`, { method: 'PUT', body: form })
    notify.success('Event saved')
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
  <div v-if="error" class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-calendar-x" title="Event not found" :actions="[{ label: 'Back to events', to: '/admin/events' }]" />
  </div>
  <template v-else-if="data && initial && previews">
    <AdminPageHeader
      :title="`Edit ${data.event.name}`"
      description="General details, agenda, speakers and partners. Ticket types are managed on the Tickets page."
      :breadcrumb="[{ label: 'Events', to: '/admin/events' }, { label: data.event.name, to: eventPath(id, 'settings') }, { label: 'Edit' }]"
    />
    <AdminEventForm :initial="initial" :previews="previews" :event-id="id" :saving="saving" @submit="update" />
  </template>
</template>
