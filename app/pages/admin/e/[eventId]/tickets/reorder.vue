<script setup lang="ts">
import type { ReorderItem } from '~/components/admin/ReorderList.vue'

definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'events.manage' })

const eventId = useEventId()
const notify = useNotify()
const { event } = useCurrentEvent()
const listHref = eventPath(eventId, 'tickets')

const { data, status, refresh } = await useFetch('/api/admin/reorder/tickets', { query: { eventId }, default: () => [] as ReorderItem[] })
const items = ref<ReorderItem[]>([])
watch(data, v => { items.value = [...v] }, { immediate: true })
const dirty = computed(() => items.value.some((it, i) => it.id !== data.value[i]?.id))

const saving = ref(false)
async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/reorder/tickets', { method: 'PUT', body: { eventId, ids: items.value.map(it => it.id) } })
    notify.success('Order saved')
    await navigateTo(listHref)
  } catch (err) {
    notify.error(err, 'Could not save the order')
    await refresh()
  } finally {
    saving.value = false
  }
}
function reset() {
  items.value = [...data.value]
}
</script>

<template>
  <AdminPageHeader
    title="Reorder ticket types"
    :description="`Drag ticket types into the order they appear on the ${event?.name ?? 'event'} registration form.`"
    :breadcrumb="[{ label: 'Tickets', to: listHref }, { label: 'Reorder' }]"
  />

  <AdminPanel class="grow">
    <div v-if="status === 'pending' && !items.length" class="flex flex-col gap-2">
      <USkeleton v-for="n in 5" :key="n" class="h-14 w-full" />
    </div>
    <div v-else-if="!items.length" class="flex flex-col items-center gap-3 py-10 text-center text-muted">
      <p>No ticket types to reorder yet.</p>
      <UButton :to="eventPath(eventId, 'tickets', 'new')" icon="i-lucide-plus" label="Add ticket type" />
    </div>
    <AdminReorderList v-else v-model="items" icon="i-lucide-ticket" :rounded="false" />
  </AdminPanel>

  <div class="sticky bottom-0 z-10 -mx-4 -mb-10 mt-auto flex flex-wrap items-center gap-3 border-t border-default bg-default px-4 py-4 sm:-mx-8 sm:px-8">
    <p class="text-sm text-muted">
      {{ dirty ? 'Unsaved changes' : 'Drag the handle, or use the arrows, to move an item.' }}
    </p>
    <div class="ml-auto flex flex-wrap gap-2">
      <UButton v-if="dirty" color="neutral" variant="ghost" label="Reset" @click="reset" />
      <UButton :to="listHref" color="neutral" variant="outline" label="Cancel" />
      <UButton label="Save order" icon="i-lucide-check" :loading="saving" :disabled="!dirty" @click="save" />
    </div>
  </div>
</template>
