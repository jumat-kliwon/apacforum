<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

// /admin has no content of its own: open the last event, else the newest one (the list is newest first)
const events = await useAdminEvents().load()
const last = useLastEventId()
const target = events.find(e => e.id === last.value) ?? events[0]
if (target) await navigateTo(eventPath(target.id), { replace: true })
</script>

<template>
  <AdminPageHeader title="Dashboard" />
  <div class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-calendar-plus" title="No events yet" description="Create the first event to start taking registrations." :actions="[{ label: 'Add event', to: '/admin/events/new', icon: 'i-lucide-plus' }]" />
  </div>
</template>
