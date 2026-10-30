<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { ticketTypeFormSchema, type TicketTypeForm, type TicketTypeFormInput } from '~~/shared/schemas/event'
import type { Currency } from '~~/shared/utils/money'

/** One ticket type of the selected event. Used by "Add ticket type" and "Edit ticket type". */
const props = defineProps<{
  eventId: string
  /** The event's currency; the price is entered in its major units (e.g. 149.50 USD). */
  currency: Currency
  initial?: TicketTypeFormInput
  saving?: boolean
  ticketId?: string
  /** Sales so far, shown next to the quota while editing. */
  sold?: number
}>()
const emit = defineEmits<{ submit: [TicketTypeForm] }>()

const state = reactive<TicketTypeFormInput>(props.initial
  ? structuredClone(toRaw(props.initial))
  : { eventId: props.eventId, code: '', name: '', price: 0, paxPerTicket: 1, quota: 0, isOnSale: true, isEarlyBird: false, earlyBirdUntil: undefined })
const { rateOf } = useCurrencyRates()
const priceHelp = computed(() => {
  const minor = toMinor(Number(state.price) || 0, props.currency) ?? 0
  const pax = Number(state.paxPerTicket) || 1
  const parts = [pax > 1 ? `${formatMoney(Math.round(minor / pax), props.currency)} per person` : null]
  if (isForeignCurrency(props.currency) && minor > 0) {
    const rate = rateOf(props.currency)
    parts.push(rate ? `≈ ${formatRupiah(convertToIdr(minor, props.currency, rate))} at today's rate` : `No ${props.currency} rate set yet`)
  }
  return parts.filter(Boolean).join(' · ') || 'Use 0 for a free ticket.'
})

function onSubmit(e: FormSubmitEvent<TicketTypeForm>) {
  emit('submit', e.data)
}
function onError(e: FormErrorEvent) {
  const first = e.errors[0]
  if (first?.id) document.getElementById(first.id)?.focus()
}
</script>

<template>
  <UForm :schema="ticketTypeFormSchema" :state="state" class="flex grow flex-col gap-6" @submit="onSubmit" @error="onError">
    <AdminPanel title="Ticket details">
      <div class="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <UFormField label="Ticket type name" name="name" required help="Shown to participants as the participant type.">
          <UInput v-model="state.name" placeholder="For example: Indonesia Delegate" class="w-full" />
        </UFormField>
        <UFormField label="Code" name="code" required help="1–6 letters or digits. Part of the e-ticket number.">
          <UInput v-model="state.code" placeholder="ID" class="w-full font-mono uppercase" />
        </UFormField>
      </div>
    </AdminPanel>

    <AdminPanel title="Price & quota">
      <div class="grid gap-4 sm:grid-cols-3">
        <UFormField label="Price" name="price" required :help="priceHelp">
          <UInput v-model.number="state.price" type="number" min="0" :step="currency === 'IDR' ? 1 : 0.01" class="w-full" :ui="{ base: 'ps-15' }">
            <template #leading>
              <span class="flex h-full items-center border-r border-default pr-2 text-sm font-medium text-toned">{{ currency }}</span>
            </template>
          </UInput>
        </UFormField>
        <UFormField label="People per ticket" name="paxPerTicket" required help="For group or delegation tickets.">
          <UInput v-model.number="state.paxPerTicket" type="number" min="1" class="w-full" />
        </UFormField>
        <UFormField label="Quota" name="quota" required :help="sold != null ? `${formatNumber(sold)} sold so far` : 'Number of tickets available.'">
          <UInput v-model.number="state.quota" type="number" min="0" class="w-full" />
        </UFormField>
      </div>
      <div class="flex items-start justify-between gap-4 rounded-md border border-default p-4">
        <div>
          <p class="text-sm font-medium text-highlighted">
            On sale
          </p>
          <p class="text-[13px]/[18px] text-muted">
            Only ticket types on sale can be chosen on the registration form.
          </p>
        </div>
        <USwitch v-model="state.isOnSale" aria-label="On sale" />
      </div>
    </AdminPanel>

    <AdminPanel title="Early bird">
      <div class="flex items-start justify-between gap-4 rounded-md border border-default p-4">
        <div>
          <p class="text-sm font-medium text-highlighted">
            Early-bird ticket
          </p>
          <p class="text-[13px]/[18px] text-muted">
            Sold at its own price until the end date, then no longer offered. Pair it with a regular ticket type for later registrations.
          </p>
        </div>
        <USwitch v-model="state.isEarlyBird" aria-label="Early-bird ticket" />
      </div>
      <UFormField v-if="state.isEarlyBird" label="Early bird ends" name="earlyBirdUntil" required help="Can be bought until 23:59 WIB on this day." class="sm:max-w-xs">
        <UInput :model-value="state.earlyBirdUntil ?? undefined" type="date" class="w-full" @update:model-value="state.earlyBirdUntil = $event" />
      </UFormField>
    </AdminPanel>

    <div class="sticky bottom-0 z-10 -mx-4 -mb-10 mt-auto flex flex-wrap items-center gap-3 border-t border-default bg-default px-4 py-4 sm:-mx-8 sm:px-8">
      <div class="ml-auto flex flex-wrap gap-2">
        <UButton :to="eventPath(eventId, 'tickets')" color="neutral" variant="ghost" label="Cancel" />
        <UButton type="submit" :label="ticketId ? 'Save changes' : 'Add ticket type'" :loading="saving" />
      </div>
    </div>
  </UForm>
</template>
