<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'any' })

// /admin has no content of its own: open the last event, else the newest one (the list is newest first),
// on the first section the user may see; without any event section, its first workspace page
const { access, can } = useAdminAccess()
const permissions = access.value!.permissions
const section = firstEventSection(permissions)
if (section === undefined) {
  await navigateTo(landingPath(permissions), { replace: true })
} else {
  const events = await useAdminEvents().load()
  const last = useLastEventId()
  const target = events.find(e => e.id === last.value) ?? events[0]
  if (target) await navigateTo(eventPath(target.id, section), { replace: true })
}
</script>

<template>
  <AdminPageHeader title="Events" />
  <div class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-calendar-plus" title="No events yet" description="Create the first event to start taking registrations." :actions="can('events.manage') ? [{ label: 'Add event', to: '/admin/events/new', icon: 'i-lucide-plus' }] : []" />
  </div>
</template>
