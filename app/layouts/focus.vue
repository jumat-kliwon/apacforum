<script setup lang="ts">
/**
 * Distraction-free layout for create/edit screens: no sidebar, only a top bar with a way back.
 * Pages set `definePageMeta({ layout: 'focus', backTo: '/admin/...' })`.
 */
const route = useRoute()
const backTo = computed(() => route.meta.backTo ?? '/admin')
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-muted">
    <header class="sticky top-0 z-20 border-b border-default bg-default">
      <div class="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-8">
        <UButton :to="backTo" color="neutral" variant="ghost" icon="i-lucide-x" aria-label="Close and go back" />
        <span class="h-6 w-px bg-(--ui-border)" aria-hidden="true" />
        <NuxtLink to="/admin" class="flex items-center gap-3">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-400 text-[15px] font-extrabold text-(--brand-ink)">A</span>
          <span class="text-[15px] font-bold text-highlighted">APCR CMS</span>
        </NuxtLink>
      </div>
    </header>
    <main class="mx-auto flex w-full max-w-6xl grow flex-col gap-6 px-4 pt-6 pb-10 sm:px-8 sm:pt-7">
      <slot />
    </main>
  </div>
</template>
