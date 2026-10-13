<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { registrationSchema, type RegistrationInput } from '~~/shared/schemas/participant'

const route = useRoute()
const slug = String(route.params.slug)
const { data, error } = await useFetch(`/api/public/events/${slug}`)
if (error.value) {
  // only a real 404 says "not found"; a server error must not look like a missing page to visitors or crawlers
  const statusCode = error.value.statusCode ?? 500
  throw createError({ statusCode, statusMessage: statusCode === 404 ? 'Event not found' : 'We could not load this event', fatal: true })
}

const ev = computed(() => data.value!.event)
useHead({ title: () => `Register · ${ev.value.name}` })

const ticketItems = computed(() => data.value!.ticketTypes.map(t => ({
  value: t.id,
  label: t.name,
  description: `${formatRupiah(t.price)}${t.paxPerTicket > 1 ? ` / ${t.paxPerTicket} people` : ''} · ${t.remaining ? `${formatNumber(t.remaining)} seats left` : 'Sold out'}`,
  disabled: !t.remaining
})))

type FormState = Omit<Partial<RegistrationInput>, 'country' | 'tshirtSize'> & { country?: string, tshirtSize?: string }
const state = reactive<FormState>({
  name: '', email: '', phone: '', organization: '', jobTitle: '', country: 'ID', city: '',
  tshirtSize: undefined, mealPreference: '', referralSource: '', ticketTypeId: undefined, agree: undefined
})
/** UForm expects the schema's input type; selects work with plain strings. */
const formState = state as unknown as Partial<RegistrationInput>
const agree = computed({ get: () => state.agree === true, set: (v: boolean) => { state.agree = v ? true : undefined } })

const submitting = ref(false)
const serverError = ref('')
type RegisterResult = { regNo?: string, invoiceNo?: string, paymentUrl: string | null, free: boolean }
const done = ref<RegisterResult | null>(null)

async function onSubmit(e: FormSubmitEvent<z.output<typeof registrationSchema>>) {
  submitting.value = true
  serverError.value = ''
  try {
    const url: string = `/api/public/events/${slug}/register`
    const result = await $fetch<RegisterResult>(url, { method: 'POST', body: e.data })
    if (result.paymentUrl) {
      // keep the button loading while the browser leaves for DOKU Checkout
      await navigateTo(result.paymentUrl, { external: true })
      return
    }
    done.value = result
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    serverError.value = errorMessage(err, 'We could not submit your registration. Please try again.')
  }
  submitting.value = false
}
function onError(e: FormErrorEvent) {
  const first = e.errors[0]
  if (first?.id) document.getElementById(first.id)?.focus()
}
</script>

<template>
  <template v-if="data">
    <UBreadcrumb :items="[{ label: ev.name, to: `/events/${slug}` }, { label: 'Register' }]" />

    <div v-if="done" class="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-md border border-default bg-default p-8 text-center shadow-xs" role="status">
      <span class="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
        <UIcon name="i-lucide-circle-check" class="size-6" />
      </span>
      <h1 class="text-2xl font-bold text-highlighted">
        Thanks for registering
      </h1>
      <p v-if="done.free" class="text-muted">
        Your registration is confirmed. We emailed your e-ticket with a QR code to <strong class="text-highlighted">{{ state.email }}</strong>.
      </p>
      <p v-else class="text-muted">
        We could not open the payment page right now. We emailed the invoice to <strong class="text-highlighted">{{ state.email }}</strong> — use the payment link in it within 48 hours.
      </p>
      <p v-if="done.regNo" class="text-sm">
        Registration no. <span class="font-mono font-medium">{{ done.regNo }}</span>
      </p>
      <p v-if="done.invoiceNo && !done.free" class="text-sm">
        Invoice <span class="font-mono font-medium">{{ done.invoiceNo }}</span>
      </p>
      <UButton :to="`/events/${slug}`" color="neutral" variant="outline" label="Back to event page" />
    </div>

    <div v-else-if="!ev.isOpen" class="rounded-md border border-default bg-default p-10">
      <UEmpty icon="i-lucide-calendar-x" title="Registration is closed" description="This event is no longer accepting registrations." :actions="[{ label: 'Back to event page', to: `/events/${slug}` }]" />
    </div>

    <div v-else class="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <UCard :ui="{ body: 'p-6 sm:p-8' }">
        <div class="mb-6 flex flex-col gap-1">
          <h1 class="text-2xl font-bold text-highlighted">
            Register for {{ ev.name }}
          </h1>
          <p class="text-sm text-muted">
            All fields are required unless marked Optional. We use these details for your name badge and certificate.
          </p>
        </div>

        <UAlert v-if="serverError" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="serverError" class="mb-6" />

        <UForm :schema="registrationSchema" :state="formState" class="flex flex-col gap-6" @submit="onSubmit" @error="onError">
          <UFormField label="Participant type" name="ticketTypeId" required>
            <URadioGroup v-model="state.ticketTypeId" :items="ticketItems" variant="card" class="w-full" />
          </UFormField>

          <div class="grid gap-5 sm:grid-cols-2">
            <UFormField label="Full name" name="name" required class="sm:col-span-2" help="As it should appear on your badge and certificate.">
              <UInput v-model="state.name" autocomplete="name" class="w-full" />
            </UFormField>
            <UFormField label="Email" name="email" required>
              <UInput v-model="state.email" type="email" autocomplete="email" class="w-full" />
            </UFormField>
            <UFormField label="Phone" name="phone" required>
              <UInput v-model="state.phone" type="tel" autocomplete="tel" placeholder="+62 812 3456 7890" class="w-full" />
            </UFormField>
            <UFormField label="Organization" name="organization" required>
              <UInput v-model="state.organization" autocomplete="organization" class="w-full" />
            </UFormField>
            <UFormField label="Job title" name="jobTitle" required>
              <UInput v-model="state.jobTitle" autocomplete="organization-title" class="w-full" />
            </UFormField>
            <UFormField label="Country" name="country" required>
              <USelect v-model="state.country" :items="toItems(COUNTRIES)" class="w-full" />
            </UFormField>
            <UFormField label="City" name="city" required>
              <UInput v-model="state.city" autocomplete="address-level2" class="w-full" />
            </UFormField>
            <UFormField label="T-shirt size" name="tshirtSize" hint="Optional">
              <USelect v-model="state.tshirtSize" :items="TSHIRT_ITEMS" placeholder="Choose a size" class="w-full" />
            </UFormField>
            <UFormField label="Meal preference" name="mealPreference" hint="Optional">
              <UInput v-model="state.mealPreference!" placeholder="For example: halal, vegetarian" class="w-full" />
            </UFormField>
            <UFormField label="How did you hear about us?" name="referralSource" hint="Optional" class="sm:col-span-2">
              <UInput v-model="state.referralSource!" class="w-full" />
            </UFormField>
          </div>

          <UFormField name="agree">
            <UCheckbox v-model="agree" label="I confirm these details are correct and agree to be contacted about this event." />
          </UFormField>

          <UButton type="submit" size="lg" label="Register and pay" :loading="submitting" class="self-start" />
        </UForm>
      </UCard>

      <aside class="flex flex-col gap-3 rounded-md border border-default bg-default p-5 shadow-xs lg:sticky lg:top-24">
        <h2 class="font-semibold text-highlighted">
          {{ ev.name }}
        </h2>
        <p class="flex items-start gap-2 text-sm">
          <UIcon name="i-lucide-calendar-days" class="mt-0.5 size-4 shrink-0 text-muted" />{{ formatDateRange(ev.startDate, ev.endDate) }}
        </p>
        <p class="flex items-start gap-2 text-sm">
          <UIcon name="i-lucide-map-pin" class="mt-0.5 size-4 shrink-0 text-muted" />{{ ev.venueName }}, {{ ev.city }}
        </p>
        <USeparator />
        <ol class="flex flex-col gap-2 text-sm text-muted">
          <li>1. Submit this form.</li>
          <li>2. You are taken to DOKU to pay — the invoice stays payable for 48 hours.</li>
          <li>3. Receive your e-ticket with a QR code by email.</li>
        </ol>
      </aside>
    </div>
  </template>
</template>
