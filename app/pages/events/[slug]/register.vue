<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { registrationSchema, type RegistrationInput } from '~~/shared/schemas/participant'

definePageMeta({ layout: 'site' })

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
  description: t.remaining ? `${formatRupiah(t.price)}${t.paxPerTicket > 1 ? ` / ${t.paxPerTicket} people` : ''}` : 'Sold out',
  disabled: !t.remaining
})))

type FormState = Omit<Partial<RegistrationInput>, 'country'> & { country?: string }
const state = reactive<FormState>({
  name: '', email: '', phone: '', organization: '', jobTitle: '', country: 'ID', city: '',
  ticketTypeId: undefined, agree: undefined
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
  <div v-if="data">
    <SiteHero
      eyebrow="REGISTRATION"
      :title="`REGISTER FOR ${ev.name.toUpperCase()}.`"
      :blurb="ev.tagline || undefined"
      title-class="text-[clamp(30px,4.4vw,54px)] leading-none tracking-[-0.047em]"
    >
      <template #under>
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-white/70">
          <span class="flex items-center gap-2"><UIcon name="i-lucide-calendar-days" class="size-4" />{{ formatDateRange(ev.startDate, ev.endDate) }}</span>
          <span class="flex items-center gap-2"><UIcon name="i-lucide-map-pin" class="size-4" />{{ ev.venueName }}, {{ ev.city }}</span>
        </div>
      </template>
    </SiteHero>

    <section class="py-20 lg:pb-[84px] lg:pt-20">
      <SiteContainer>
        <div v-if="done" class="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-[2px] border border-ink/16 bg-white p-8 text-center sm:p-11" role="status">
          <span class="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <UIcon name="i-lucide-circle-check" class="size-6" />
          </span>
          <h2 class="text-[clamp(24px,2.9vw,34px)] font-extrabold leading-[1.12] tracking-[-0.032em] text-ink">
            Thanks for registering
          </h2>
          <p v-if="done.free" class="text-[16px] leading-[1.7] text-prose">
            Your registration is confirmed. We emailed your e-ticket with a QR code to <strong class="text-ink">{{ state.email }}</strong>.
          </p>
          <p v-else class="text-[16px] leading-[1.7] text-prose">
            We could not open the payment page right now. We emailed the invoice to <strong class="text-ink">{{ state.email }}</strong> — use the payment link in it within 48 hours.
          </p>
          <p v-if="done.regNo" class="text-sm">
            Registration no. <span class="font-mono font-medium">{{ done.regNo }}</span>
          </p>
          <p v-if="done.invoiceNo && !done.free" class="text-sm">
            Invoice <span class="font-mono font-medium">{{ done.invoiceNo }}</span>
          </p>
          <SiteButton :to="`/events/${slug}`" variant="dark">
            Back to event page
          </SiteButton>
        </div>

        <div v-else-if="!ev.isOpen" class="rounded-[2px] border border-ink/16 bg-white p-10">
          <UEmpty icon="i-lucide-calendar-x" title="Registration is closed" description="This event is no longer accepting registrations." :actions="[{ label: 'Back to event page', to: `/events/${slug}` }]" />
        </div>

        <div v-else class="rounded-[2px] border border-ink/16 bg-white p-6 sm:p-8 lg:p-11">
          <div class="mb-8 flex flex-col gap-3">
            <SiteEyebrow>PARTICIPANT DETAILS</SiteEyebrow>
            <p class="text-[14px] leading-[1.7] text-prose">
              All fields are required. We use these details for your name badge and certificate.
            </p>
          </div>

          <UAlert v-if="serverError" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="serverError" class="mb-6" />

          <UForm :schema="registrationSchema" :state="formState" class="flex flex-col gap-6" @submit="onSubmit" @error="onError">
            <UFormField label="Participant type" name="ticketTypeId" required>
              <URadioGroup
                v-model="state.ticketTypeId"
                :items="ticketItems"
                variant="card"
                class="w-full"
                :ui="{
                  fieldset: 'grid gap-3 md:grid-cols-3',
                  item: 'rounded-[2px] border-ink/16 bg-white p-5 has-data-[state=checked]:border-navy has-data-[state=checked]:bg-paper-soft',
                  label: 'text-[15px] font-extrabold leading-[1.3] text-ink',
                  description: 'mt-1.5 text-[14px] text-prose'
                }"
              />
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
            </div>

            <UFormField name="agree">
              <UCheckbox v-model="agree" label="I confirm these details are correct and agree to be contacted about this event." />
            </UFormField>

            <UButton type="submit" size="lg" label="Register and pay" :loading="submitting" trailing-icon="i-lucide-arrow-right" class="self-start rounded-[2px] bg-navy px-6 py-4 text-[12px] font-extrabold tracking-[0.067em] text-white hover:bg-navy-deep" />
          </UForm>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
