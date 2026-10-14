<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AdminEventOption } from '~/composables/useAdminEvents'

const route = useRoute()
const { events } = useAdminEvents()
const { event: current } = useCurrentEvent()

/** "2–4 Dec 2026 · Medan", plus the status when it is not the usual Published. The narrow trigger leaves out the city. */
function meta(e: AdminEventOption, withCity = true) {
  return [formatDateRange(e.startDate, e.endDate, 'short'), withCity && e.city, e.status === 'published' ? null : EVENT_STATUS[e.status].label]
    .filter(Boolean).join(' · ')
}

// the same gold tile as the CMS logo marks the event you are in
const tile = (active: boolean) => [
  'flex h-9 min-w-9 shrink-0 items-center justify-center rounded-sm px-1 font-mono text-[10px] font-bold tracking-wide',
  active ? 'bg-brand-400 text-(--brand-ink)' : 'bg-elevated text-toned'
]

const eventOf = (item: DropdownMenuItem) => item.event as AdminEventOption

const items = computed<DropdownMenuItem[][]>(() => [
  [
    { type: 'label', label: 'Events' },
    ...(events.value ?? []).map(e => ({
      slot: 'event' as const,
      label: e.name,
      event: e,
      onSelect: () => navigateTo(switchEventPath(route.path, route.query, e.id))
    }))
  ],
  [
    { label: 'Manage events', icon: 'i-lucide-settings-2', to: '/admin/events' },
    { label: 'New event', icon: 'i-lucide-plus', to: '/admin/events/new' }
  ]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'start', sideOffset: 6 }"
    :ui="{
      content: 'w-75 max-h-[min(30rem,var(--reka-dropdown-menu-content-available-height))]',
      label: 'px-2 pt-2 pb-1 text-[11px]/4 font-medium uppercase tracking-[1.1px] text-muted',
      item: 'py-2'
    }"
  >
    <button
      type="button"
      class="group flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-(--focus-ring) data-[state=open]:bg-elevated"
      :aria-label="current ? `Event: ${current.name}. Switch event` : 'Choose an event'"
    >
      <span :class="tile(!!current)">
        <template v-if="current">{{ current.code }}</template>
        <UIcon v-else name="i-lucide-calendar-days" class="size-4" />
      </span>
      <span class="flex min-w-0 grow flex-col">
        <span class="truncate text-sm font-semibold text-highlighted">{{ current?.name ?? 'Choose an event' }}</span>
        <span v-if="current" class="truncate text-xs text-muted">{{ meta(current, false) }}</span>
      </span>
      <UIcon name="i-lucide-chevrons-up-down" class="size-4 shrink-0 text-dimmed transition-colors group-hover:text-toned" />
    </button>

    <template #event="{ item }">
      <span class="flex w-full min-w-0 items-center gap-3">
        <span :class="tile(eventOf(item).id === current?.id)">{{ eventOf(item).code }}</span>
        <span class="flex min-w-0 grow flex-col items-start text-left">
          <span class="max-w-full truncate text-sm font-medium text-highlighted">{{ eventOf(item).name }}</span>
          <span class="max-w-full truncate text-xs text-muted">{{ meta(eventOf(item)) }}</span>
        </span>
        <UIcon v-if="eventOf(item).id === current?.id" name="i-lucide-check" class="size-4 shrink-0 text-primary" />
      </span>
    </template>
  </UDropdownMenu>
</template>
