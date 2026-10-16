<script setup lang="ts">
import type { PartnerForm, PartnerFormInput } from '~~/shared/schemas/event'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const eventId = useEventId()
const notify = useNotify()
const id = String(route.params.partnerId)
const { data, error } = await useFetch(`/api/admin/partners/${id}`)
// a partner of another event is not found here
const missing = computed(() => !!error.value || (data.value && data.value.eventId !== eventId))

const initial = computed<PartnerFormInput | undefined>(() => {
  const p = data.value
  if (!p) return undefined
  return { eventId: p.eventId, name: p.name, category: p.category, logoKey: p.logoKey, showHome: p.showHome }
})

const saving = ref(false)
async function update(form: PartnerForm) {
  saving.value = true
  try {
    await $fetch(`/api/admin/partners/${id}`, { method: 'PUT', body: form })
    notify.success('Partner saved')
    await navigateTo(eventPath(eventId, 'partners'))
  } catch (err) {
    notify.error(err, 'Could not save the partner')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="missing" class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-handshake" title="Partner not found" :actions="[{ label: 'Back to partners', to: eventPath(eventId, 'partners') }]" />
  </div>
  <template v-else-if="data && initial">
    <AdminPageHeader :title="`Edit ${data.name}`" :breadcrumb="[{ label: 'Partners', to: eventPath(eventId, 'partners') }, { label: data.name }]">
      <template #badges>
        <UBadge color="neutral" variant="subtle" :label="PARTNER_CATEGORY[data.category]" />
        <UBadge v-if="data.showHome" color="primary" variant="subtle" icon="i-lucide-house" label="On home page" />
      </template>
    </AdminPageHeader>
    <AdminPartnerForm :event-id="eventId" :initial="initial" :logo-url="data.logoUrl" :partner-id="id" :saving="saving" @submit="update" />
  </template>
</template>
