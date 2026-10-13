<script setup lang="ts">
useHead({ title: 'Events' })
const { data } = await useFetch('/api/public/events')
</script>

<template>
  <div class="flex flex-col gap-2">
    <h1 class="text-[32px]/10 font-bold tracking-tight text-highlighted">
      Upcoming events
    </h1>
    <p class="text-muted">
      Register for APCR forums and dialogues across ASEAN.
    </p>
  </div>

  <div v-if="data?.length" class="grid gap-6 md:grid-cols-2">
    <UCard v-for="e in data" :key="e.slug" :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
      <div class="aspect-[16/7] bg-elevated">
        <img v-if="e.bannerUrl" :src="e.bannerUrl" :alt="`${e.name} banner`" class="size-full object-cover">
      </div>
      <div class="flex flex-col gap-3 p-5">
        <div class="flex items-center gap-2">
          <UBadge :color="e.isOpen ? 'success' : 'neutral'" :label="e.isOpen ? 'Registration open' : 'Registration closed'" />
        </div>
        <div>
          <h2 class="text-xl font-semibold text-highlighted">
            <NuxtLink :to="`/events/${e.slug}`" class="hover:underline">{{ e.name }}</NuxtLink>
          </h2>
          <p v-if="e.tagline" class="text-sm text-muted">
            {{ e.tagline }}
          </p>
        </div>
        <p class="flex items-center gap-2 text-sm">
          <UIcon name="i-lucide-calendar-days" class="size-4 text-muted" />
          {{ formatDateRange(e.startDate, e.endDate) }} · {{ e.venueName }}, {{ e.city }}
        </p>
        <div class="flex gap-2">
          <UButton :to="`/events/${e.slug}`" color="neutral" variant="outline" label="Event details" />
          <UButton v-if="e.isOpen" :to="`/events/${e.slug}/register`" label="Register" />
        </div>
      </div>
    </UCard>
  </div>
  <UEmpty v-else icon="i-lucide-calendar" title="No upcoming events" description="Check back soon." class="rounded-2xl border border-default bg-default p-10" />
</template>
