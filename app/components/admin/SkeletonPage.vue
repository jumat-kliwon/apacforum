<script setup lang="ts">
import type { PageSkeleton } from '~/utils/adminRoutes'

/** Shown while a CMS page loads; the shape follows the page that is opening. */
defineProps<{ variant: PageSkeleton }>()
</script>

<template>
  <div class="flex flex-col gap-6" role="status" aria-live="polite">
    <span class="sr-only">Loading…</span>

    <!-- page header -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex min-w-0 flex-col gap-2.5">
        <USkeleton v-if="variant !== 'dashboard'" class="h-3 w-40" />
        <USkeleton class="h-8 w-72 max-w-full" />
        <USkeleton class="h-3.5 w-96 max-w-full" />
      </div>
      <div class="flex gap-3">
        <USkeleton v-if="variant === 'detail'" class="h-9 w-28 rounded-sm" />
        <USkeleton v-if="variant !== 'form'" class="h-9 w-36 rounded-sm" />
      </div>
    </div>

    <!-- stat cards -->
    <div v-if="variant !== 'form'" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="i in 4" :key="i" class="flex flex-col gap-3 rounded-md border border-default bg-default p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <USkeleton class="h-3 w-24" />
          <USkeleton class="size-8 rounded-sm" />
        </div>
        <USkeleton class="h-7 w-20" />
      </div>
    </div>

    <!-- list: toolbar + rows -->
    <div v-if="variant === 'list'" class="flex flex-col gap-4 rounded-2xl border border-default bg-default p-4 shadow-xs">
      <div class="flex flex-wrap items-center gap-4 p-2">
        <USkeleton class="h-11 w-full rounded-md sm:w-80" />
        <USkeleton class="ml-auto h-9 w-28 rounded-sm" />
      </div>
      <div class="-mx-4 border-t border-default">
        <AdminSkeletonRows :rows="7" :columns="5" />
      </div>
    </div>

    <!-- detail: tabs + description list -->
    <template v-else-if="variant === 'detail'">
      <div class="flex gap-8 border-b border-default pb-3">
        <USkeleton v-for="i in 4" :key="i" class="h-4 w-20" />
      </div>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div class="flex flex-col gap-4 rounded-2xl border border-default bg-default p-4 shadow-xs">
          <USkeleton class="h-5 w-32" />
          <div v-for="i in 7" :key="i" class="grid grid-cols-[minmax(120px,200px)_1fr] gap-6">
            <USkeleton class="h-3.5 w-24" />
            <USkeleton class="h-3.5" :class="i % 2 ? 'w-3/5' : 'w-2/5'" />
          </div>
        </div>
        <div class="flex flex-col gap-4 rounded-2xl border border-default bg-default p-4 shadow-xs">
          <USkeleton class="h-5 w-28" />
          <USkeleton class="aspect-video w-full rounded-md" />
        </div>
      </div>
    </template>

    <!-- form: field panels -->
    <template v-else-if="variant === 'form'">
      <div v-for="p in 2" :key="p" class="flex flex-col gap-4 rounded-2xl border border-default bg-default p-4 shadow-xs">
        <USkeleton class="h-5 w-36" />
        <div class="grid gap-4 sm:grid-cols-2">
          <div v-for="f in (p === 1 ? 4 : 3)" :key="f" class="flex flex-col gap-2">
            <USkeleton class="h-3.5 w-28" />
            <USkeleton class="h-11 w-full rounded-md" />
          </div>
        </div>
      </div>
    </template>

    <!-- dashboard: chart + side panel -->
    <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div class="flex flex-col gap-4 rounded-2xl border border-default bg-default p-4 shadow-xs">
        <USkeleton class="h-5 w-40" />
        <USkeleton class="h-64 w-full rounded-md" />
      </div>
      <div class="flex flex-col gap-4 rounded-2xl border border-default bg-default p-4 shadow-xs">
        <USkeleton class="h-5 w-32" />
        <USkeleton v-for="i in 5" :key="i" class="h-4 w-full" />
      </div>
    </div>
  </div>
</template>
