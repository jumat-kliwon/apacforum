<script setup lang="ts">
/**
 * A vertical list the admin reorders by dragging the handle, or with the arrow buttons
 * (keyboard and touch). The order is local until the page saves it.
 */
export type ReorderItem = { id: string, title: string, subtitle: string, imageUrl: string | null }

const props = defineProps<{
  /** Icon shown when an item has no image. */
  icon: string
  /** Square images (photos, logos) are drawn as avatars. */
  rounded?: boolean
}>()
const items = defineModel<ReorderItem[]>({ required: true })

const dragIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)
const announce = ref('')

function move(from: number, to: number) {
  if (from === to || to < 0 || to >= items.value.length) return
  const next = [...items.value]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item!)
  items.value = next
  announce.value = `${item!.title} moved to position ${to + 1} of ${next.length}`
}

function onDragStart(e: DragEvent, i: number) {
  dragIndex.value = i
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', items.value[i]!.id)
  }
}
function onDragOver(e: DragEvent, i: number) {
  if (dragIndex.value === null) return
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  if (dragIndex.value !== i) {
    move(dragIndex.value, i)
    dragIndex.value = i
  }
  overIndex.value = i
}
function onDragEnd() {
  dragIndex.value = null
  overIndex.value = null
}

async function moveBy(i: number, delta: number, e: Event) {
  move(i, i + delta)
  // keep focus on the same button of the moved row
  const label = (e.currentTarget as HTMLElement).getAttribute('data-dir')
  await nextTick()
  document.querySelector<HTMLElement>(`[data-row="${i + delta}"] [data-dir="${label}"]`)?.focus()
}
</script>

<template>
  <ol class="flex flex-col gap-2" aria-label="Drag items to change their order">
    <li
      v-for="(item, i) in items"
      :key="item.id"
      :data-row="i"
      draggable="true"
      class="group flex items-center gap-3 rounded-md border bg-default px-3 py-2.5 transition-shadow select-none"
      :class="dragIndex === i ? 'border-primary opacity-60 shadow-md' : 'border-default hover:border-accented'"
      @dragstart="onDragStart($event, i)"
      @dragover="onDragOver($event, i)"
      @drop.prevent="onDragEnd"
      @dragend="onDragEnd"
    >
      <UIcon name="i-lucide-grip-vertical" class="size-5 shrink-0 cursor-grab text-dimmed group-hover:text-muted active:cursor-grabbing" aria-hidden="true" />
      <span class="w-7 shrink-0 text-right text-sm font-semibold text-muted tabular-nums">{{ i + 1 }}</span>
      <UAvatar
        v-if="item.imageUrl || props.rounded"
        :src="item.imageUrl ?? undefined"
        :text="initials(item.title)"
        :alt="item.title"
        size="md"
        class="shrink-0 bg-brand-50 text-brand-900"
      />
      <span v-else class="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-50 text-brand-800"><UIcon :name="icon" class="size-4" /></span>
      <div class="min-w-0 grow">
        <p class="truncate font-semibold text-highlighted">
          {{ item.title }}
        </p>
        <p class="truncate text-xs text-muted">
          {{ item.subtitle }}
        </p>
      </div>
      <div class="flex shrink-0 gap-1">
        <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-arrow-up" data-dir="up" :disabled="i === 0" :aria-label="`Move ${item.title} up`" @click="moveBy(i, -1, $event)" />
        <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-arrow-down" data-dir="down" :disabled="i === items.length - 1" :aria-label="`Move ${item.title} down`" @click="moveBy(i, 1, $event)" />
      </div>
    </li>
  </ol>
  <p class="sr-only" aria-live="polite">
    {{ announce }}
  </p>
</template>
