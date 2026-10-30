<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug)
const { data, error } = await useFetch(`/api/public/events/${slug}`)
if (error.value) {
  // only a real 404 says "not found"; a server error must not look like a missing page to visitors or crawlers
  const statusCode = error.value.statusCode ?? 500
  throw createError({ statusCode, statusMessage: statusCode === 404 ? 'Event not found' : 'We could not load this event', fatal: true })
}

const ev = computed(() => data.value!.event)
useSeoMeta({
  title: () => ev.value.name,
  description: () => ev.value.tagline ?? descriptionToText(ev.value.description).slice(0, 160),
  ogImage: () => ev.value.bannerUrl ?? undefined
})

const partnerGroups = computed(() => (Object.keys(PARTNER_CATEGORY) as (keyof typeof PARTNER_CATEGORY)[])
  .map(key => ({ label: PARTNER_CATEGORY[key], items: data.value!.partners.filter(p => p.category === key) }))
  .filter(g => g.items.length))
</script>

<template>
  <template v-if="data">
    <section class="overflow-hidden rounded-md border border-default bg-default shadow-xs">
      <div v-if="ev.bannerUrl" class="aspect-[16/6] bg-elevated">
        <img :src="ev.bannerUrl" :alt="`${ev.name} banner`" class="size-full object-cover">
      </div>
      <div class="flex flex-col gap-4 p-6 sm:p-8">
        <UBadge :color="ev.isOpen ? 'success' : 'neutral'" :label="ev.isOpen ? 'Registration open' : 'Registration closed'" class="self-start" />
        <div class="flex flex-col gap-2">
          <h1 class="text-[32px]/10 font-bold tracking-tight text-highlighted sm:text-[40px]/12">
            {{ ev.name }}
          </h1>
          <p v-if="ev.tagline" class="text-lg text-muted">
            {{ ev.tagline }}
          </p>
        </div>
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span class="flex items-center gap-2"><UIcon name="i-lucide-calendar-days" class="size-4 text-muted" />{{ formatDateRange(ev.startDate, ev.endDate) }}</span>
          <span class="flex items-center gap-2"><UIcon name="i-lucide-map-pin" class="size-4 text-muted" />{{ [ev.venueName, ev.venueAddress, ev.city].filter(Boolean).join(', ') }}</span>
          <span v-if="ev.isOpen" class="flex items-center gap-2"><UIcon name="i-lucide-clock" class="size-4 text-muted" />Register by {{ formatDateTime(ev.registrationDeadline) }} WIB</span>
        </div>
        <!-- sanitized on save by server/utils/sanitizeDescription.ts -->
        <div class="rich-text max-w-3xl text-default" v-html="descriptionToHtml(ev.description)" />
        <UButton v-if="ev.isOpen" :to="`/events/${slug}/register`" size="lg" label="Register now" trailing-icon="i-lucide-arrow-right" class="self-start" />
      </div>
    </section>

    <section v-if="data.agendaDays.length" aria-labelledby="agenda" class="flex flex-col gap-4">
      <h2 id="agenda" class="text-2xl font-semibold text-highlighted">
        Agenda
      </h2>
      <div class="grid gap-4 md:grid-cols-3">
        <article v-for="(d, i) in data.agendaDays" :key="d.id" class="flex flex-col gap-2 rounded-md border border-default bg-default p-5 shadow-xs">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] font-medium uppercase tracking-[1.1px] text-muted">Day {{ i + 1 }}</span>
            <UBadge color="primary" :label="d.label" />
          </div>
          <span class="text-sm text-muted">{{ formatIsoDateWithDay(d.date) }}</span>
          <h3 class="font-semibold text-highlighted">
            {{ d.theme }}
          </h3>
          <p class="text-sm text-muted">
            {{ d.body }}
          </p>
        </article>
      </div>
    </section>

    <section v-if="data.speakers.length" aria-labelledby="speakers" class="flex flex-col gap-4">
      <h2 id="speakers" class="text-2xl font-semibold text-highlighted">
        Speakers
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="s in data.speakers" :key="s.id" class="flex flex-col gap-3 rounded-md border border-default bg-default p-5 shadow-xs">
          <UAvatar :src="s.photoUrl ?? undefined" :text="initials(s.name)" :alt="s.name" size="3xl" class="bg-brand-50 text-brand-900" />
          <div>
            <h3 class="font-semibold text-highlighted">
              {{ s.name }}
            </h3>
            <p class="text-sm text-muted">
              {{ s.title }}
            </p>
          </div>
          <div class="mt-auto flex flex-wrap gap-2">
            <UBadge color="neutral" variant="outline" :label="SPEAKER_CATEGORY[s.category]" />
            <UBadge v-if="s.dayLabel" color="neutral" :label="s.dayLabel" />
          </div>
        </article>
      </div>
    </section>

    <section v-if="partnerGroups.length" aria-labelledby="partners" class="flex flex-col gap-4">
      <h2 id="partners" class="text-2xl font-semibold text-highlighted">
        Partners
      </h2>
      <div v-for="g in partnerGroups" :key="g.label" class="flex flex-col gap-3">
        <h3 class="text-[11px] font-medium uppercase tracking-[1.1px] text-muted">
          {{ g.label }}
        </h3>
        <div class="flex flex-wrap gap-3">
          <component
            :is="p.websiteUrl ? 'a' : 'div'"
            v-for="p in g.items"
            :key="p.id"
            :href="p.websiteUrl ?? undefined"
            :target="p.websiteUrl ? '_blank' : undefined"
            :rel="p.websiteUrl ? 'noopener noreferrer' : undefined"
            class="flex h-16 min-w-40 items-center justify-center gap-3 rounded-sm border border-default bg-default px-4"
            :class="{ 'transition-colors hover:border-accented': p.websiteUrl }"
          >
            <img v-if="p.logoUrl" :src="p.logoUrl" :alt="p.name" class="max-h-10 max-w-32 object-contain">
            <span v-else class="text-sm font-semibold text-highlighted">{{ p.name }}</span>
          </component>
        </div>
      </div>
    </section>

    <section v-if="data.ticketTypes.length" aria-labelledby="tickets" class="flex flex-col gap-4">
      <h2 id="tickets" class="text-2xl font-semibold text-highlighted">
        Tickets
      </h2>
      <div class="grid gap-4 md:grid-cols-3">
        <article v-for="t in data.ticketTypes" :key="t.id" class="flex flex-col gap-2 rounded-md border border-default bg-default p-5 shadow-xs">
          <h3 class="font-semibold text-highlighted">
            {{ t.name }}
          </h3>
          <UBadge
            v-if="t.earlyBirdUntil"
            :color="t.earlyBirdEnded ? 'neutral' : 'success'"
            variant="subtle"
            :icon="t.earlyBirdEnded ? 'i-lucide-timer-off' : 'i-lucide-timer'"
            :label="`Early bird ${t.earlyBirdEnded ? 'ended' : 'until'} ${formatDateTime(t.earlyBirdUntil)} WIB`"
            class="self-start"
          />
          <p class="text-2xl font-bold tabular-nums" :class="t.earlyBirdEnded ? 'text-muted line-through' : 'text-highlighted'">
            {{ formatMoney(t.price, ev.currency) }}<span v-if="t.paxPerTicket > 1" class="text-sm font-normal text-muted"> / {{ t.paxPerTicket }} people</span>
          </p>
          <p v-if="t.priceIdr" class="text-sm tabular-nums text-muted">
            ≈ {{ formatRupiah(t.priceIdr) }}
          </p>
          <p v-if="!t.earlyBirdEnded" class="text-sm" :class="t.remaining ? 'text-muted' : 'text-error'">
            {{ t.remaining ? `${formatNumber(t.remaining)} seats left` : 'Sold out' }}
          </p>
        </article>
      </div>
      <p v-if="ev.currency !== 'IDR'" class="text-sm text-muted">
        Payment is made in Indonesian rupiah (IDR). Rupiah amounts are estimates; the final amount is fixed when your invoice is issued.
      </p>
      <UButton v-if="ev.isOpen" :to="`/events/${slug}/register`" size="lg" label="Register now" trailing-icon="i-lucide-arrow-right" class="self-start" />
    </section>
  </template>
</template>
