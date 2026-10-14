<script setup lang="ts">
/** Placeholder table rows: a leading avatar column, then plain cells. Used in a UTable `#loading` slot. */
withDefaults(defineProps<{ rows?: number, columns?: number }>(), { rows: 6, columns: 4 })
// varied widths so the rows do not look like a grid of identical bars
const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-2/5', 'w-3/5']
</script>

<template>
  <div class="flex flex-col text-left" role="status" aria-label="Loading">
    <div v-for="r in rows" :key="r" class="flex items-center gap-6 border-b border-default px-4 py-4 last:border-b-0">
      <div class="flex min-w-0 flex-[1.4] items-center gap-3">
        <USkeleton class="size-9 shrink-0 rounded-full" />
        <div class="flex min-w-0 grow flex-col gap-2">
          <USkeleton class="h-3.5" :class="widths[r % widths.length]" />
          <USkeleton class="h-3 w-2/5" />
        </div>
      </div>
      <div v-for="c in columns - 1" :key="c" class="hidden min-w-0 flex-1 sm:block">
        <USkeleton class="h-3.5" :class="widths[(r + c) % widths.length]" />
      </div>
    </div>
  </div>
</template>
