<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import type { AdminEventOption } from '~/composables/useAdminEvents'

/**
 * Event switcher in the top bar: the current event as a breadcrumb trigger, and a searchable
 * list of every event grouped by state. ⌘K / Ctrl+K opens it from anywhere in the CMS.
 */
const route = useRoute()
const { events } = useAdminEvents()
const { can } = useAdminAccess()
const { event: current } = useCurrentEvent()

const open = ref(false)
defineShortcuts({ meta_k: () => { open.value = !open.value } })

// the same gold tile as the CMS logo marks the event you are in
const tile = (active: boolean, size = 'h-7 min-w-7') => [
  size,
  'flex shrink-0 items-center justify-center rounded-sm px-1 font-mono text-[10px] font-bold tracking-wide',
  active ? 'bg-brand-400 text-(--brand-ink)' : 'bg-elevated text-toned'
]

type EventItem = CommandPaletteItem & { event: AdminEventOption }

function toItem(e: AdminEventOption): EventItem {
  return {
    slot: 'event',
    label: e.name,
    description: [formatDateRange(e.startDate, e.endDate, 'short'), e.city].filter(Boolean).join(' · '),
    event: e,
    onSelect: () => {
      open.value = false
      navigateTo(switchEventPath(route.path, route.query, e.id))
    }
  }
}

const groups = computed<CommandPaletteGroup[]>(() => {
  const list = events.value ?? []
  const today = new Date().toISOString().slice(0, 10)
  const by = (test: (e: AdminEventOption) => boolean) => list.filter(test).map(toItem)
  const go = (to: string) => () => {
    open.value = false
    navigateTo(to)
  }
  return [
    { id: 'upcoming', label: 'Upcoming', items: by(e => e.status === 'published' && e.endDate >= today) },
    { id: 'draft', label: 'Drafts', items: by(e => e.status === 'draft') },
    { id: 'past', label: 'Past', items: by(e => e.status === 'published' && e.endDate < today) },
    { id: 'archived', label: 'Archived', items: by(e => e.status === 'archived') },
    {
      id: 'actions',
      label: 'Events',
      items: can('events.manage')
        ? [
            { label: 'Add event', icon: 'i-lucide-plus', onSelect: go('/admin/events/new') },
            { label: 'Manage events', icon: 'i-lucide-settings-2', onSelect: go('/admin/events') }
          ]
        : []
    }
  ].filter(g => g.items.length)
})
const eventOf = (item: CommandPaletteItem) => (item as EventItem).event
</script>

<template>
  <UPopover v-model:open="open" :content="{ align: 'start', sideOffset: 8 }" :ui="{ content: 'w-[min(28rem,calc(100vw-2rem))] p-0' }">
    <button
      type="button"
      class="group flex min-w-0 items-center gap-2.5 rounded-md border border-default bg-default py-1.5 ps-1.5 pe-2.5 text-left transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-(--focus-ring) data-[state=open]:bg-elevated"
      :aria-label="current ? `Current event: ${current.name}. Switch event` : 'Choose an event'"
    >
      <span :class="tile(!!current)">
        <template v-if="current">{{ current.code }}</template>
        <UIcon v-else name="i-lucide-calendar-days" class="size-4" />
      </span>
      <span class="truncate text-sm font-semibold text-highlighted">{{ current?.name ?? 'Choose an event' }}</span>
      <UBadge v-if="current" v-bind="EVENT_STATUS[current.status]" size="sm" class="hidden sm:inline-flex" />
      <UIcon name="i-lucide-chevrons-up-down" class="size-4 shrink-0 text-dimmed transition-colors group-hover:text-toned" />
    </button>

    <template #content>
      <UCommandPalette
        :groups="groups"
        placeholder="Search events by name, code or city"
        :fuse="{ fuseOptions: { keys: ['label', 'description', 'event.code'] } }"
        :ui="{ root: 'max-h-[min(28rem,70dvh)]', label: 'px-2 pt-2 pb-1 text-[11px]/4 font-medium uppercase tracking-[1.1px] text-muted' }"
      >
        <template #event-leading="{ item }">
          <span :class="tile(eventOf(item).id === current?.id, 'h-9 min-w-9')">{{ eventOf(item).code }}</span>
        </template>
        <template #event-trailing="{ item }">
          <UIcon v-if="eventOf(item).id === current?.id" name="i-lucide-check" class="size-4 shrink-0 text-primary" />
        </template>
      </UCommandPalette>
    </template>
  </UPopover>
</template>
