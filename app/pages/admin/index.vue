<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'any' })

// /admin has no content of its own: it opens the user's home page, and shows this only when there is no event yet
const { access, can } = useAdminAccess()
const home = await adminHomePath(access.value!.permissions)
if (home) await navigateTo(home, { replace: true })
</script>

<template>
  <AdminPageHeader title="Events" />
  <div class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-calendar-plus" title="No events yet" description="Create the first event to start taking registrations." :actions="can('events.manage') ? [{ label: 'Add event', to: '/admin/events/new', icon: 'i-lucide-plus' }] : []" />
  </div>
</template>
