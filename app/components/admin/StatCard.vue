<script setup lang="ts">
defineProps<{ label: string, value: string, note?: string, icon: string }>()
</script>

<template>
  <div class="flex flex-col gap-2 rounded-2xl border border-default bg-default p-5 shadow-xs">
    <div class="flex items-center justify-between gap-2">
      <span class="text-sm font-medium text-muted">{{ label }}</span>
      <span class="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-800">
        <UIcon :name="icon" class="size-4" />
      </span>
    </div>
    <span class="text-[28px]/9 font-bold tracking-tight text-highlighted tabular-nums">{{ value }}</span>
    <span v-if="note" class="text-xs text-muted">{{ note }}</span>
  </div>
</template>
