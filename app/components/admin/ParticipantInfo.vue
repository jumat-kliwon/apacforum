<script setup lang="ts">
type User = {
  email: string
  phone: string | null
  organization: string | null
  jobTitle: string | null
  country: string | null
  city: string | null
  tshirtSize: string | null
  mealPreference: string | null
  referralSource: string | null
}
const props = defineProps<{ user: User }>()
defineEmits<{ edit: [] }>()

const notify = useNotify()
const fields = computed(() => {
  const u = props.user
  return [
    ['Email', u.email],
    ['Phone', u.phone],
    ['Organization', u.organization],
    ['Job title', u.jobTitle],
    ['Country', u.country ? (COUNTRIES[u.country as keyof typeof COUNTRIES] ?? u.country) : null],
    ['City', u.city],
    ['T-shirt size', u.tshirtSize],
    ['Meal preference', u.mealPreference],
    ['Heard about us from', u.referralSource]
  ] as [string, string | null][]
})
// empty answers fold into one line instead of a column of dashes
const filled = computed(() => fields.value.filter(([, v]) => v))
const missing = computed(() => fields.value.filter(([, v]) => !v).map(([k]) => k))

async function copyEmail() {
  await navigator.clipboard.writeText(props.user.email)
  notify.success('Email copied')
}
</script>

<template>
  <AdminPanel title="Participant" description="From the registration form">
    <template #actions>
      <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-pencil" label="Edit" @click="$emit('edit')" />
    </template>
    <dl class="flex flex-col gap-3 text-sm">
      <div v-for="[k, v] in filled" :key="k" class="flex min-w-0 flex-col gap-0.5">
        <dt class="text-xs text-muted">
          {{ k }}
        </dt>
        <dd class="flex min-w-0 items-center gap-1 font-medium text-highlighted">
          <span class="break-words">{{ v }}</span>
          <UButton v-if="k === 'Email'" size="xs" color="neutral" variant="ghost" icon="i-lucide-copy" aria-label="Copy email" @click="copyEmail" />
        </dd>
      </div>
    </dl>
    <p v-if="missing.length" class="border-t border-default pt-3 text-xs text-muted">
      Not filled in: {{ missing.join(', ') }}
    </p>
  </AdminPanel>
</template>
