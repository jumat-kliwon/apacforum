<script setup lang="ts">
/**
 * Inline "Order" cell: a small number field that saves on Enter or blur.
 * Lower numbers come first (0, 1, 2, …); rows with the same number are ordered by name.
 */
const props = defineProps<{
  /** e.g. `/api/admin/speakers/<id>/order` */
  url: string
  value: number
  /** For the accessible label, e.g. the row's name. */
  name: string
}>()
const emit = defineEmits<{ saved: [number] }>()

const notify = useNotify()
const draft = ref(String(props.value))
const saving = ref(false)
watch(() => props.value, (v) => { draft.value = String(v) })

async function save() {
  const text = String(draft.value ?? '').trim()
  const n = Number(text)
  if (text === '' || !Number.isInteger(n) || n < 0 || n > 9999) {
    notify.error({ statusMessage: 'Use a whole number from 0 to 9999' }, 'Invalid order')
    draft.value = String(props.value)
    return
  }
  if (n === props.value || saving.value) return
  saving.value = true
  try {
    await $fetch(props.url, { method: 'PUT', body: { sortOrder: n } })
    notify.success(`${props.name} moved to position ${n}`)
    emit('saved', n)
  } catch (err) {
    notify.error(err)
    draft.value = String(props.value)
  } finally {
    saving.value = false
  }
}

function onEscape(e: KeyboardEvent) {
  draft.value = String(props.value)
  ;(e.target as HTMLInputElement).blur()
}
</script>

<template>
  <UInput
    v-model="draft"
    type="number"
    inputmode="numeric"
    min="0"
    max="9999"
    step="1"
    size="sm"
    :loading="saving"
    :disabled="saving"
    :aria-label="`Order of ${name}`"
    class="w-16"
    :ui="{ base: 'tabular-nums' }"
    @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
    @keydown.esc="onEscape"
    @blur="save"
  />
</template>
