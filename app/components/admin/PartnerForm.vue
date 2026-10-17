<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { partnerFormSchema, type PartnerForm, type PartnerFormInput } from '~~/shared/schemas/event'

/** One partner of the selected event. Used by "Add partner" and "Edit partner". */
const props = defineProps<{
  eventId: string
  initial?: PartnerFormInput
  /** URL of the logo already saved. */
  logoUrl?: string | null
  saving?: boolean
  partnerId?: string
}>()
const emit = defineEmits<{ submit: [PartnerForm] }>()

const state = reactive<PartnerFormInput>(props.initial
  ? structuredClone(toRaw(props.initial))
  : { eventId: props.eventId, name: '', category: 'strategic', logoKey: null, websiteUrl: '', showHome: false })

const CATEGORY_ITEMS = toItems(PARTNER_CATEGORY)

function onSubmit(e: FormSubmitEvent<PartnerForm>) {
  emit('submit', e.data)
}
function onError(e: FormErrorEvent) {
  const first = e.errors[0]
  if (first?.id) document.getElementById(first.id)?.focus()
}
</script>

<template>
  <UForm :schema="partnerFormSchema" :state="state" class="flex grow flex-col gap-6" @submit="onSubmit" @error="onError">
    <AdminPanel title="Partner details">
      <div class="flex flex-wrap items-start gap-6">
        <AdminImageUpload v-model="state.logoKey" folder="partners" :preview-url="logoUrl" label="Logo" hint="PNG, JPG or WebP. A transparent PNG works best." variant="square" />
        <div class="grid min-w-0 grow gap-4 sm:grid-cols-2">
          <UFormField label="Partner name" name="name" required help="Shown when there is no logo, and as the logo's alt text.">
            <UInput v-model="state.name" placeholder="Organization name" class="w-full" />
          </UFormField>
          <UFormField label="Category" name="category" required help="Partners are grouped by category on the website.">
            <USelect v-model="state.category" :items="CATEGORY_ITEMS" class="w-full" />
          </UFormField>
          <UFormField label="Website" name="websiteUrl" hint="Optional" help="Clicking the logo on the website opens this link." class="sm:col-span-2">
            <UInput v-model="state.websiteUrl!" type="url" placeholder="https://example.com" class="w-full" />
          </UFormField>
        </div>
      </div>
      <div class="flex items-start justify-between gap-4 rounded-md border border-default p-4">
        <div>
          <p class="text-sm font-medium text-highlighted">
            Show on home page
          </p>
          <p class="text-[13px]/[18px] text-muted">
            Adds this partner to the partners section of the website's home page.
          </p>
        </div>
        <USwitch v-model="state.showHome" aria-label="Show on home page" />
      </div>
    </AdminPanel>

    <div class="sticky bottom-0 z-10 -mx-4 -mb-10 mt-auto flex flex-wrap items-center gap-3 border-t border-default bg-default px-4 py-4 sm:-mx-8 sm:px-8">
      <div class="ml-auto flex flex-wrap gap-2">
        <UButton :to="eventPath(eventId, 'partners')" color="neutral" variant="ghost" label="Cancel" />
        <UButton type="submit" :label="partnerId ? 'Save changes' : 'Add partner'" :loading="saving" />
      </div>
    </div>
  </UForm>
</template>
