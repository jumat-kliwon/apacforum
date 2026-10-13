<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const props = defineProps<{
  title: string
  description?: string
  breadcrumb?: BreadcrumbItem[]
}>()

useHead({ title: () => props.title })
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-3">
    <div class="flex min-w-0 flex-col gap-1">
      <UBreadcrumb v-if="breadcrumb?.length" :items="breadcrumb" :ui="{ link: 'text-[13px]' }" />
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-[28px]/9 font-bold tracking-tight text-highlighted">
          {{ title }}
        </h1>
        <slot name="badges" />
      </div>
      <p v-if="description || $slots.description" class="text-sm text-muted">
        <slot name="description">
          {{ description }}
        </slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
