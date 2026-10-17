<script setup lang="ts">
/**
 * Bar shown above an admin table while rows are ticked: how many, the page's own bulk actions
 * (default slot), and Delete behind a confirmation. Rows the server refuses stay ticked.
 */
const props = defineProps<{
  ids: string[]
  /** POST endpoint taking `{ ids }`, answering `{ affected, failed? }`. */
  url: string
  /** Singular and plural, e.g. `['speaker', 'speakers']`. */
  noun: [string, string]
  /** What else goes with the rows, for the confirmation. "This cannot be undone." is added. */
  description: string
  /** Extra body fields for endpoints that take more than ids. */
  body?: Record<string, unknown>
}>()
const emit = defineEmits<{ deleted: [] }>()

const notify = useNotify()
const open = ref(false)
const busy = ref(false)
const count = (n: number) => `${formatNumber(n)} ${n === 1 ? props.noun[0] : props.noun[1]}`

async function remove() {
  busy.value = true
  try {
    const res = await $fetch<{ affected: number, failed?: { id: string, message: string }[] }>(props.url, {
      method: 'POST',
      body: { ...props.body, ids: props.ids }
    })
    const failed = res.failed ?? []
    if (res.affected) notify.success(`${count(res.affected)} deleted`)
    if (failed.length) {
      const reasons = [...new Set(failed.map(f => f.message))].join(' ')
      notify.error({ statusMessage: reasons }, `${count(failed.length)} could not be deleted`)
    }
    open.value = false
    emit('deleted')
  } catch (err) {
    notify.error(err)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div v-if="ids.length" role="region" aria-label="Bulk actions" class="flex flex-wrap items-center justify-between gap-4 rounded-md bg-brand-50 px-5 py-3 dark:bg-[#2e2a18]">
    <span aria-live="polite" class="text-sm font-semibold text-highlighted">{{ formatNumber(ids.length) }} selected</span>
    <div class="ml-auto flex flex-wrap gap-2">
      <slot />
      <UButton size="sm" color="error" variant="soft" icon="i-lucide-trash-2" label="Delete" @click="open = true" />
    </div>
  </div>

  <AdminConfirmDialog
    v-model:open="open"
    :title="`Delete ${count(ids.length)}?`"
    :description="`${description} This cannot be undone.`"
    :confirm-label="`Delete ${count(ids.length)}`"
    :loading="busy"
    @confirm="remove"
  />
</template>
