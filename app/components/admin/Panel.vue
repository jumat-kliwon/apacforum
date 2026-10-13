<script setup lang="ts">
defineProps<{ title?: string, description?: string }>()
</script>

<template>
  <section class="flex flex-col gap-4 rounded-md border border-default bg-default p-4 shadow-xs">
    <div v-if="title || $slots.actions" class="flex flex-wrap items-center gap-3">
      <div class="flex min-w-0 flex-col">
        <h2 v-if="title" class="text-base/6 font-semibold text-highlighted">
          {{ title }}
        </h2>
        <p v-if="description" class="text-[13px]/[18px] text-muted">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.actions" class="ml-auto flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </section>
</template>
