<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AdminEventOption } from '~/composables/useAdminEvents'

const route = useRoute()
const { events } = useAdminEvents()
const { event: current } = useCurrentEvent()

const items = computed<DropdownMenuItem[][]>(() => [
  (events.value ?? []).map(e => ({
    label: e.name,
    icon: e.id === current.value?.id ? 'i-lucide-check' : 'i-lucide-calendar-days',
    status: e.status,
    onSelect: () => navigateTo(switchEventPath(route.path, route.query, e.id))
  })),
  [
    { label: 'Manage events', icon: 'i-lucide-settings-2', to: '/admin/events' },
    { label: 'New event', icon: 'i-lucide-plus', to: '/admin/events/new' }
  ]
])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'start' }" :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) max-h-96' }">
    <UButton
      color="neutral"
      variant="outline"
      block
      trailing-icon="i-lucide-chevrons-up-down"
      class="h-auto justify-between px-3 py-2"
      :aria-label="current ? `Event: ${current.name}. Switch event` : 'Choose an event'"
    >
      <span class="flex min-w-0 flex-col items-start gap-1">
        <span class="w-full truncate text-left text-sm font-semibold text-highlighted">{{ current?.name ?? 'Choose an event' }}</span>
        <UBadge v-if="current" v-bind="EVENT_STATUS[current.status]" size="sm" />
      </span>
    </UButton>

    <template #item-trailing="{ item }">
      <UBadge v-if="item.status" v-bind="EVENT_STATUS[item.status as AdminEventOption['status']]" size="sm" />
    </template>
  </UDropdownMenu>
</template>
