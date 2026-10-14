<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const route = useRoute()
const notFound = computed(() => props.error.statusCode === 404)
const inAdmin = computed(() => route.path.startsWith('/admin'))
useHead({ title: () => (notFound.value ? 'Page not found' : 'Something went wrong') })

const home = computed(() => (inAdmin.value ? '/admin' : '/'))
</script>

<template>
  <UApp>
    <NuxtLayout name="default">
      <div class="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-md border border-default bg-default p-8 text-center shadow-xs">
        <span class="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-800">
          <UIcon :name="notFound ? 'i-lucide-search-x' : 'i-lucide-triangle-alert'" class="size-6" />
        </span>
        <p class="font-mono text-sm text-muted">
          {{ error.statusCode }}
        </p>
        <h1 class="text-2xl font-bold text-highlighted">
          {{ notFound ? 'We could not find that page' : 'Something went wrong' }}
        </h1>
        <p class="text-muted">
          {{ notFound ? (error.statusMessage || 'The link may be old, or the page has moved.') : 'Please try again in a moment.' }}
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <UButton v-if="!notFound" label="Try again" icon="i-lucide-rotate-cw" @click="clearError({ redirect: route.fullPath })" />
          <UButton :label="inAdmin ? 'Back to dashboard' : 'Back to home'" color="neutral" variant="outline" @click="clearError({ redirect: home })" />
        </div>
      </div>
    </NuxtLayout>
  </UApp>
</template>
