<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { currencyRateFormSchema, type CurrencyRateForm } from '~~/shared/schemas/settings'

definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'settings.manage' })
useHead({ title: 'Currency rates' })

const notify = useNotify()
const { data: rates, refresh } = await useFetch('/api/admin/settings/currency-rates')

// one small form per currency, so saving USD never resubmits SGD
const drafts = reactive<Record<string, { currency: CurrencyRateForm['currency'], rateIdr: string }>>({})
watchEffect(() => {
  for (const r of rates.value ?? []) {
    drafts[r.currency] ??= { currency: r.currency, rateIdr: r.rateIdr ? String(Number(r.rateIdr)) : '' }
  }
})

const saving = ref<string | null>(null)
async function save(e: FormSubmitEvent<CurrencyRateForm>) {
  saving.value = e.data.currency
  try {
    await $fetch('/api/admin/settings/currency-rates', { method: 'PUT', body: e.data })
    notify.success(`${e.data.currency} rate saved`)
    await refresh()
  } catch (err) {
    notify.error(err, 'Could not save the rate')
  } finally {
    saving.value = null
  }
}
</script>

<template>
  <AdminPageHeader
    title="Currency rates"
    description="Events priced in USD or SGD are charged in rupiah through DOKU. The price is converted at these rates when the invoice is issued and rounded up to the next rupiah."
  />

  <div class="grid gap-6 lg:grid-cols-2">
    <AdminPanel v-for="r in rates" :key="r.currency" :title="r.currency === 'USD' ? 'US dollar (USD)' : 'Singapore dollar (SGD)'">
      <UForm v-if="drafts[r.currency]" :schema="currencyRateFormSchema" :state="drafts[r.currency]!" class="flex flex-col gap-4" @submit="save">
        <UFormField :label="`Rupiah per 1 ${r.currency}`" name="rateIdr" required help="Up to 4 decimals.">
          <UInput v-model="drafts[r.currency]!.rateIdr" inputmode="decimal" :placeholder="r.currency === 'USD' ? '16250' : '12500'" class="w-full" :ui="{ base: 'ps-15' }">
            <template #leading>
              <span class="flex h-full items-center border-r border-default pr-2 text-sm font-medium text-toned">IDR</span>
            </template>
          </UInput>
        </UFormField>

        <UAlert
          v-if="!r.rateIdr"
          color="warning"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          :title="`No ${r.currency} rate yet`"
          :description="r.events ? `Registrations for ${r.events} ${r.events === 1 ? 'event' : 'events'} in ${r.currency} are refused until a rate is set.` : `Events priced in ${r.currency} cannot take payments until a rate is set.`"
        />
        <p class="text-[13px]/[18px] text-muted">
          A new rate applies to invoices issued from now on. Unpaid invoices keep the rate they were issued with.
        </p>

        <div class="flex justify-end">
          <UButton type="submit" :label="`Save ${r.currency} rate`" :loading="saving === r.currency" />
        </div>
      </UForm>
    </AdminPanel>
  </div>
</template>
