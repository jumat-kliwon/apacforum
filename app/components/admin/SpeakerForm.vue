<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { speakerFormSchema, type SpeakerForm, type SpeakerFormInput } from '~~/shared/schemas/event'

/** One speaker of the selected event. Used by "Add speaker" and "Edit speaker". */
const props = defineProps<{
  eventId: string
  initial?: SpeakerFormInput
  /** URL of the photo already saved. */
  photoUrl?: string | null
  saving?: boolean
  speakerId?: string
}>()
const emit = defineEmits<{ submit: [SpeakerForm] }>()

const state = reactive<SpeakerFormInput>(props.initial
  ? structuredClone(toRaw(props.initial))
  : { eventId: props.eventId, name: '', title: '', category: 'government', agendaDayId: null, photoKey: null, status: 'published' })

// sessions are the event's agenda days, edited on the event form
const { data: days } = await useFetch(`/api/admin/events/${props.eventId}/agenda-days`, { default: () => [] })
const NO_SESSION = '__none'
const dayItems = computed(() => [
  { label: 'No session', value: NO_SESSION },
  ...days.value.map(d => ({ label: `Day ${d.sortOrder} · ${d.label}`, value: d.id }))
])
const dayModel = computed({
  get: () => state.agendaDayId ?? NO_SESSION,
  set: (v: string) => { state.agendaDayId = v === NO_SESSION ? null : v }
})

const CATEGORY_ITEMS = toItems(SPEAKER_CATEGORY)

function onSubmit(e: FormSubmitEvent<SpeakerForm>) {
  emit('submit', e.data)
}
function onError(e: FormErrorEvent) {
  const first = e.errors[0]
  if (first?.id) document.getElementById(first.id)?.focus()
}
</script>

<template>
  <UForm :schema="speakerFormSchema" :state="state" class="flex grow flex-col gap-6" @submit="onSubmit" @error="onError">
    <AdminPanel title="Speaker details">
      <div class="flex flex-wrap items-start gap-6">
        <AdminImageUpload v-model="state.photoKey" folder="speakers" :preview-url="photoUrl" label="Photo" hint="JPG, PNG or WebP. A square portrait works best." variant="square" />
        <div class="grid min-w-0 grow gap-4 sm:grid-cols-2">
          <UFormField label="Name" name="name" required>
            <UInput v-model="state.name" placeholder="Full name and title" class="w-full" />
          </UFormField>
          <UFormField label="Position & institution" name="title" required>
            <UInput v-model="state.title" placeholder="For example: CCO, Straits Capital Group" class="w-full" />
          </UFormField>
          <UFormField label="Category" name="category" required>
            <USelect v-model="state.category" :items="CATEGORY_ITEMS" class="w-full" />
          </UFormField>
          <UFormField label="Session" name="agendaDayId" :help="days.length ? undefined : 'Add agenda days in Event settings to pick a session.'">
            <USelect v-model="dayModel" :items="dayItems" class="w-full" />
          </UFormField>
        </div>
      </div>
      <div class="flex items-start justify-between gap-4 rounded-md border border-default p-4">
        <div>
          <p class="text-sm font-medium text-highlighted">
            Published
          </p>
          <p class="text-[13px]/[18px] text-muted">
            Only published speakers appear on the website.
          </p>
        </div>
        <USwitch :model-value="state.status === 'published'" aria-label="Published" @update:model-value="v => state.status = v ? 'published' : 'draft'" />
      </div>
    </AdminPanel>

    <div class="sticky bottom-0 z-10 -mx-4 -mb-10 mt-auto flex flex-wrap items-center gap-3 border-t border-default bg-default px-4 py-4 sm:-mx-8 sm:px-8">
      <div class="ml-auto flex flex-wrap gap-2">
        <UButton :to="eventPath(eventId, 'speakers')" color="neutral" variant="ghost" label="Cancel" />
        <UButton type="submit" :label="speakerId ? 'Save changes' : 'Add speaker'" :loading="saving" />
      </div>
    </div>
  </UForm>
</template>
