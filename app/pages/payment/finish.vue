<script setup lang="ts">
/** Where DOKU Checkout sends the payer back. The real status arrives through the DOKU notification. */
useHead({ title: 'Payment' })
const route = useRoute()
const invoice = computed(() => (typeof route.query.invoice === 'string' ? route.query.invoice : null))
const simulated = computed(() => route.query.simulated === '1')
</script>

<template>
  <div class="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-md border border-default bg-default p-8 text-center shadow-xs">
    <span class="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-800">
      <UIcon name="i-lucide-receipt" class="size-6" />
    </span>
    <h1 class="text-2xl font-bold text-highlighted">
      Thanks — we are confirming your payment
    </h1>
    <p class="text-muted">
      As soon as DOKU confirms the payment, we email your e-ticket with a QR code. This usually takes a few minutes.
    </p>
    <p v-if="invoice" class="text-sm">
      Invoice <span class="font-mono font-medium">{{ invoice }}</span>
    </p>
    <UAlert
      v-if="simulated"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Development mode"
      description="DOKU credentials are not set, so this payment link is simulated and no payment was taken."
    />
    <UButton to="/" color="neutral" variant="outline" label="Back to events" />
  </div>
</template>
