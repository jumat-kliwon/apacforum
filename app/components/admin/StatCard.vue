<script setup lang="ts">
defineProps<{ label: string, value: string, note?: string, icon: string }>()
</script>

<template>
  <div class="flex flex-col gap-1 rounded-md border border-default bg-default p-5 shadow-xs">
    <div class="flex items-center justify-between gap-2">
      <span class="text-[13px]/[18px] font-medium text-muted">{{ label }}</span>
      <span class="flex size-8 items-center justify-center rounded-sm bg-brand-50 text-brand-800">
        <UIcon :name="icon" class="size-4" />
      </span>
    </div>
    <span class="text-2xl/[30px] font-bold text-highlighted tabular-nums">{{ value }}</span>
    <span v-if="note" class="text-xs text-muted">{{ note }}</span>
  </div>
</template>
