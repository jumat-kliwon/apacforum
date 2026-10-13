<script setup lang="ts">
/** Dialog konfirmasi tindakan berbahaya (hapus, refund). */
const open = defineModel<boolean>('open', { default: false })
defineProps<{
  title: string
  description: string
  confirmLabel: string
  icon?: string
  loading?: boolean
  color?: 'error' | 'primary'
}>()
const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="description" :ui="{ content: 'max-w-md' }" role="alertdialog">
    <template #header>
      <div class="flex gap-4">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-full" :class="color === 'primary' ? 'bg-brand-50 text-brand-800' : 'bg-error/10 text-error'">
          <UIcon :name="icon ?? 'i-lucide-trash-2'" class="size-5" />
        </span>
        <div class="flex flex-col gap-1">
          <h2 class="text-base font-semibold text-highlighted">
            {{ title }}
          </h2>
          <p class="text-sm text-muted">
            {{ description }}
          </p>
          <slot />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Batalkan" @click="open = false" />
        <UButton :color="color ?? 'error'" :label="confirmLabel" :loading="loading" @click="emit('confirm')" />
      </div>
    </template>
  </UModal>
</template>
