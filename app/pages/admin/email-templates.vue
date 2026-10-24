<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin', permission: 'email_templates.view' })
useHead({ title: 'Email templates' })

const { data: list } = await useFetch('/api/admin/email-templates')
const route = useRoute()
const router = useRouter()
const selected = computed({
  get: () => (typeof route.query.t === 'string' ? route.query.t : list.value?.[0]?.key) ?? 'registration-verified',
  set: (t: string) => router.replace({ query: { t } })
})
const { data: preview, status } = await useFetch(() => `/api/admin/email-templates/${selected.value}`)

const groups = computed(() => (['Registration', 'Payment', 'Event'] as const).map(label => ({
  label,
  items: (list.value ?? []).filter(t => t.group === label)
})))

const TONE_ICON: Record<string, string> = {
  info: 'i-lucide-message-square-text', success: 'i-lucide-circle-check', warning: 'i-lucide-clock', danger: 'i-lucide-circle-alert', neutral: 'i-lucide-rotate-ccw'
}
const TONE_CLASS: Record<string, string> = {
  info: 'bg-info/10 text-info', success: 'bg-success/10 text-success', warning: 'bg-warning/10 text-warning', danger: 'bg-error/10 text-error', neutral: 'bg-elevated text-muted'
}
const statusColor = (label: string) => {
  const all = [...Object.values(REGISTRATION_STATUS), ...Object.values(PAYMENT_STATUS)] as { label: string, color: BadgeColor }[]
  return all.find(s => s.label === label)?.color ?? 'neutral'
}
</script>

<template>
  <AdminPageHeader title="Participant email templates" description="Sent automatically when a registration or payment status changes. Content is fixed in the code; this page shows a preview with sample data." />

  <div class="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
    <nav aria-label="Email templates" class="flex flex-col gap-4 rounded-md border border-default bg-default p-3 shadow-xs">
      <div v-for="g in groups" :key="g.label" class="flex flex-col gap-1">
        <p class="px-2 pt-1 text-[11px] font-medium uppercase tracking-[1.1px] text-muted">
          {{ g.label }}
        </p>
        <button
          v-for="t in g.items"
          :key="t.key"
          type="button"
          class="flex items-start gap-3 rounded-sm border p-2.5 text-left transition-colors"
          :class="selected === t.key ? 'border-brand-700 bg-brand-50 dark:bg-[#2e2a18]' : 'border-transparent hover:bg-muted'"
          :aria-pressed="selected === t.key"
          @click="selected = t.key"
        >
          <span class="flex size-8 shrink-0 items-center justify-center rounded-sm" :class="TONE_CLASS[t.tone]">
            <UIcon :name="TONE_ICON[t.tone]!" class="size-4" />
          </span>
          <span class="flex min-w-0 flex-col">
            <span class="text-sm font-semibold text-highlighted">{{ t.name }}</span>
            <span class="text-xs text-muted">{{ t.trigger }}</span>
          </span>
        </button>
      </div>
    </nav>

    <section v-if="preview" class="flex flex-col gap-4" aria-live="polite">
      <AdminPanel :title="preview.name">
        <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
          <dt class="text-muted">Trigger</dt>
          <dd class="font-medium text-highlighted">{{ preview.trigger }}</dd>
          <dt class="text-muted">Status</dt>
          <dd class="flex flex-wrap gap-2">
            <UBadge :color="statusColor(preview.registration)" :label="`Registration: ${preview.registration}`" />
            <UBadge :color="statusColor(preview.payment)" :label="`Payment: ${preview.payment}`" />
          </dd>
          <dt class="text-muted">Subject</dt>
          <dd class="font-medium text-highlighted">{{ preview.subject }}</dd>
          <dt class="text-muted">Preheader</dt>
          <dd class="text-default">{{ preview.preheader }}</dd>
        </dl>
      </AdminPanel>

      <div class="overflow-hidden rounded-md border border-default bg-default shadow-xs">
        <iframe
          :srcdoc="preview.html"
          :title="`Email preview: ${preview.name}`"
          sandbox=""
          class="h-[900px] w-full"
          :class="{ 'opacity-60': status === 'pending' }"
        />
      </div>
    </section>
  </div>
</template>
