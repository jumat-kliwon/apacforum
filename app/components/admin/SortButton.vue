<script setup lang="ts">
defineProps<{ label: string, active: boolean, dir: 'asc' | 'desc' }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    class="-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 font-semibold hover:text-highlighted focus-visible:outline-2 focus-visible:outline-primary"
    :class="active ? 'text-highlighted' : 'text-muted'"
    @click="$emit('toggle')"
  >
    {{ label }}
    <UIcon :name="active ? (dir === 'asc' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down') : 'i-lucide-chevrons-up-down'" class="size-4" />
  </button>
</template>
