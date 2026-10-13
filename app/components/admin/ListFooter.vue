<script setup lang="ts">
const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })
defineProps<{ total: number, rangeText: string }>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
    <div class="flex flex-wrap items-center gap-4">
      <label class="flex items-center gap-2">
        <span>Rows per page</span>
        <USelect v-model="pageSize" :items="[10, 25, 50, 100]" size="sm" class="w-20" aria-label="Rows per page" />
      </label>
      <span aria-live="polite">{{ rangeText }}</span>
    </div>
    <UPagination v-model:page="page" :total="total" :items-per-page="pageSize" :sibling-count="1" show-edges size="sm" />
  </div>
</template>
