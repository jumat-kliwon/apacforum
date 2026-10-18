<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })
useHead({ title: 'Admin sign in' })

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password')
})
type Schema = z.output<typeof schema>

const state = reactive({ email: '', password: '' })
const show = ref(false)
const loading = ref(false)
const error = ref('')
const route = useRoute()

async function onSubmit(e: FormSubmitEvent<Schema>) {
  loading.value = true
  error.value = ''
  // on success the button keeps spinning until the CMS page replaces this one; navigateTo resolves
  // before that page has loaded its data, so `loading` is only reset when the sign-in fails
  const fail = (message: string) => {
    error.value = message
    loading.value = false
  }
  try {
    const { data, error: err } = await authClient.signIn.email({ email: e.data.email, password: e.data.password })
    if (err || !data) return fail(err?.status === 401 ? 'Wrong email or password' : (err?.message ?? 'Could not sign in'))
    // the event list the home page needs loads alongside the access check (a role without access gets a 403, swallowed here)
    useAdminEvents().load().catch(() => {})
    // the role decides what the CMS shows; a role without permissions (e.g. participants) has no access
    const me = await $fetch<AdminAccess>('/api/admin/me').catch(() => null)
    if (!me) {
      await authClient.signOut()
      return fail('This account has no admin access')
    }
    useAdminAccess().access.value = me
    useAdminSessionCheckedAt().value = Date.now()
    // straight to the home page (no stop at /admin), or back to the page that asked to sign in
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/admin')
      ? route.query.redirect
      : (await adminHomePath(me.permissions).catch(() => null)) ?? '/admin'
    await navigateTo(redirect)
  } catch (err) {
    fail(errorMessage(err, 'Could not sign in'))
  }
}
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted px-4 py-12">
    <UCard class="w-full max-w-[440px] shadow-sm" :ui="{ body: 'p-8 sm:p-8' }">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col items-center gap-3 text-center">
          <span class="flex size-10 items-center justify-center rounded-sm bg-brand-400 text-lg font-extrabold text-(--brand-ink)">A</span>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-highlighted">
              APCR CMS
            </h1>
            <p class="text-sm text-muted">
              Manage APCR participants, transactions and events.
            </p>
          </div>
        </div>

        <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="error" />

        <UForm :schema="schema" :state="state" class="flex flex-col gap-5" @submit="onSubmit">
          <UFormField label="Email" name="email">
            <UInput v-model="state.email" type="email" icon="i-lucide-mail" placeholder="admin@apcrforum.com" autocomplete="email" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Password" name="password">
            <UInput v-model="state.password" :type="show ? 'text' : 'password'" icon="i-lucide-lock" placeholder="Enter your password" autocomplete="current-password" size="lg" class="w-full">
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="show ? 'Hide password' : 'Show password'"
                  :aria-pressed="show"
                  @click="show = !show"
                />
              </template>
            </UInput>
          </UFormField>
          <UButton type="submit" label="Sign in" size="lg" block :loading="loading" />
        </UForm>
      </div>
    </UCard>
    <span class="text-[13px] text-muted">apcrforum.com</span>
  </div>
</template>
