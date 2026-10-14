<script setup lang="ts">
import { AUDIENCE, DAYS, FAQ, PASSES, SPEAKERS, SPEAKER_FILTERS, TRAVEL } from '~/data/apcr2026'
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'APCR 2026',
  description: 'Three interconnected days bringing regional leadership, ASEAN business and future-ready knowledge into one trust ecosystem. 2–4 December 2026, Medan, Indonesia.',
  themeColor: '#031735'
})

/** The forum is a real event in the CMS; link to its form when registration is open. */
const FEATURED_SLUG = 'apcr-2026'
const { data: events } = await useFetch('/api/public/events')
const registerHref = computed(() => {
  const ev = events.value?.find(e => e.slug === FEATURED_SLUG)
  if (!ev) return '#registration'
  return ev.isOpen ? `/events/${ev.slug}/register` : `/events/${ev.slug}`
})

const speakerFilter = ref('All')
const visibleSpeakers = computed(() => (
  speakerFilter.value === 'All'
    ? SPEAKERS
    : SPEAKERS.filter(s => s.category === speakerFilter.value.toUpperCase())
))

const letter = (i: number) => String.fromCharCode(97 + i)
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-navy-deep">
      <img src="/landing/apcr2026-hero.jpg" alt="" width="1185" height="648" fetchpriority="high" class="absolute inset-0 size-full object-cover">
      <div class="absolute inset-0" style="background: linear-gradient(to right, #031735f7 0%, #031735eb 50%, #03173599 100%)" />

      <SiteContainer>
        <div class="relative flex min-h-[520px] flex-col justify-center gap-6 py-20 lg:min-h-[648px]">
          <SiteEyebrow dark>
            APCR 2026
          </SiteEyebrow>
          <h1 class="text-[clamp(40px,6.6vw,78px)] font-extrabold leading-[0.98] tracking-[-0.051em] text-white">
            THREE DAYS.<br>A BIGGER IMPACT.
          </h1>
          <div class="flex flex-wrap items-center gap-3.5">
            <p class="text-[19px] font-extrabold text-gold-soft">
              2–4 December 2026
            </p>
            <span class="hidden h-4 w-px bg-white/35 sm:block" />
            <p class="text-[18px] text-white/85">
              Medan, Indonesia
            </p>
          </div>
          <p class="max-w-[800px] text-[19px] leading-[1.65] text-white/85">
            Three interconnected days bringing regional leadership, ASEAN business and future-ready knowledge into one trust ecosystem.
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-2.5">
            <SiteButton :to="registerHref" size="lg" icon="i-lucide-arrow-right">
              REGISTER NOW
            </SiteButton>
            <SiteButton to="#programme" variant="light" size="lg">
              VIEW THE PROGRAMME
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Overview -->
    <section class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-9">
          <SiteSectionHead eyebrow="OVERVIEW" title="ONE FORUM, THREE MOVEMENTS.">
            <template #intro>
              Each day stands on its own and feeds the next. Delegates can join a single day, but the argument only completes across all three.
            </template>
          </SiteSectionHead>

          <ul class="grid gap-6 lg:grid-cols-3">
            <li v-for="day in DAYS" :key="day.n" class="flex flex-col gap-3.5 rounded-[2px] border border-ink/16 bg-white px-[26px] pb-7 pt-[26px]">
              <div class="flex items-center justify-between gap-3">
                <span class="text-[12px] font-extrabold tracking-[0.108em] text-gold">{{ day.n }}</span>
                <span class="text-[12px] text-prose-dim">{{ day.weekday }}</span>
              </div>
              <h3 class="text-[26px] font-extrabold leading-[1.15] tracking-[-0.035em] text-ink">
                {{ day.name }}
              </h3>
              <p class="text-[15px] leading-[1.68] text-prose">
                {{ day.tagline }}
              </p>
            </li>
          </ul>

          <div class="flex flex-col items-center gap-5 rounded-[2px] bg-navy-deep px-9 pb-11 pt-10">
            <p class="text-center text-[11px] font-extrabold tracking-[0.127em] text-gold-soft">
              TOGETHER, THE THREE DAYS CREATE A JOURNEY
            </p>
            <p class="flex flex-wrap items-center justify-center gap-5 text-center text-[clamp(22px,3.4vw,34px)] font-extrabold tracking-[-0.012em] text-white">
              REGION <UIcon name="i-lucide-arrow-right" class="size-[22px] text-gold" />
              BUSINESS <UIcon name="i-lucide-arrow-right" class="size-[22px] text-gold" />
              KNOWLEDGE
            </p>
            <p class="flex flex-wrap items-center justify-center gap-5 text-center text-[clamp(16px,2.2vw,22px)] font-extrabold tracking-[0.027em] text-white/70">
              TRUST <UIcon name="i-lucide-arrow-right" class="size-[18px] text-gold" />
              VALUE <UIcon name="i-lucide-arrow-right" class="size-[18px] text-gold" />
              IMPACT
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Programme -->
    <section id="programme" class="border-t border-ink/16 bg-white py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <SiteSectionHead eyebrow="PROGRAMME" title="THREE DAYS, IN DETAIL.">
            <template #intro>
              Session-level agenda is published progressively from October 2026. Topics below are confirmed tracks.
            </template>
          </SiteSectionHead>

          <div v-for="day in DAYS" :key="day.n" class="flex flex-col gap-6 border-t border-ink/16 pb-2.5 pt-[30px] lg:flex-row lg:gap-14">
            <div class="flex flex-col gap-2.5 lg:w-[260px] lg:shrink-0">
              <span class="text-[13px] font-extrabold tracking-[0.1em] text-gold">{{ day.n }}</span>
              <span class="text-[14px] text-prose">{{ day.date }}</span>
              <span class="text-[22px] font-extrabold leading-[1.2] tracking-[-0.027em] text-navy">{{ day.name }}</span>
            </div>
            <div class="flex flex-1 flex-col gap-4">
              <h3 class="text-[clamp(22px,2.6vw,30px)] font-extrabold leading-[1.18] tracking-[-0.033em] text-ink">
                {{ day.tagline }}
              </h3>
              <p class="text-[16px] leading-[1.75] text-prose">
                {{ day.copy }}
              </p>
              <ul class="flex flex-wrap gap-2.5 pt-2">
                <li v-for="topic in day.topics" :key="topic" class="rounded-[2px] bg-paper px-[13px] py-2 text-[12px] font-bold text-navy">
                  {{ topic }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Speakers -->
    <section id="speakers" class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="SPEAKERS" title="MEET THE PEOPLE SHAPING ASEAN'S TRUST AGENDA." size="md" col-class="lg:w-[700px]">
            <template #intro>
              New speakers are confirmed monthly through to November 2026.
            </template>
          </SiteSectionHead>

          <div class="flex flex-col gap-4 border-b border-ink/16 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div class="flex flex-wrap gap-2" role="group" aria-label="Filter speakers by sector">
              <button
                v-for="f in SPEAKER_FILTERS"
                :key="f"
                type="button"
                class="rounded-[2px] px-3.5 py-2.5 text-[12px] font-bold transition-colors"
                :class="speakerFilter === f ? 'bg-navy text-white' : 'border border-ink/16 text-prose hover:border-ink/35'"
                :aria-pressed="speakerFilter === f"
                @click="speakerFilter = f"
              >
                {{ f }}
              </button>
            </div>
            <p class="text-[13px] text-prose-dim">
              {{ visibleSpeakers.length }} of 24 speakers confirmed
            </p>
          </div>

          <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="s in visibleSpeakers" :key="s.name" class="flex flex-col overflow-hidden rounded-[2px] border border-ink/16 bg-white">
              <img :src="s.photo" :alt="s.name" width="257" height="244" loading="lazy" class="h-[244px] w-full object-cover">
              <div class="flex flex-1 flex-col gap-2 px-5 pb-[22px] pt-5">
                <span class="text-[10px] font-extrabold tracking-[0.11em] text-gold">{{ s.category }}</span>
                <h3 class="text-[17px] font-extrabold leading-[1.25] tracking-[-0.018em] text-ink">
                  {{ s.name }}
                </h3>
                <p class="text-[13px] text-prose">
                  {{ s.role }}
                </p>
                <p class="text-[12px] text-prose-dim">
                  {{ s.org }}
                </p>
              </div>
            </li>
          </ul>

          <div class="flex flex-wrap items-center justify-between gap-8 pt-2">
            <p class="text-[14px] text-prose">
              Speaker proposals for the 2026 programme close 30 September 2026.
            </p>
            <!-- A full speaker directory is still to come. -->
            <p class="flex items-center gap-2 text-[13px] font-bold text-ink/35">
              View all speakers
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Who should attend -->
    <section id="audience" class="bg-paper py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <SiteSectionHead eyebrow="WHO SHOULD ATTEND" title="FIND YOUR PLACE AT APCR.">
            <template #intro>
              The room is built deliberately: six constituencies, each with a reason to be there and something the others need.
            </template>
          </SiteSectionHead>

          <ul class="grid gap-8 lg:grid-cols-2">
            <li v-for="(a, i) in AUDIENCE" :key="a.title" class="flex gap-[18px] border-t border-ink/16 pb-1 pt-[22px]">
              <span class="flex size-8 shrink-0 items-center justify-center rounded-[2px] bg-navy-deep text-[14px] font-extrabold text-gold-soft">{{ letter(i) }}</span>
              <div class="flex flex-col gap-2">
                <h3 class="text-[20px] font-extrabold leading-[1.25] tracking-[-0.025em] text-ink">
                  {{ a.title }}
                </h3>
                <p class="text-[15px] leading-[1.7] text-prose">
                  {{ a.copy }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Venue & travel -->
    <section id="venue" class="border-t border-ink/16 bg-white py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <SiteSectionHead eyebrow="VENUE &amp; TRAVEL" title="GETTING TO MEDAN." />

          <div class="flex flex-col gap-10 lg:flex-row lg:gap-14">
            <div class="flex flex-col gap-[18px] lg:w-[500px] lg:shrink-0">
              <img src="/landing/venue-santika.jpg" alt="Hotel and convention centre exterior" width="500" height="330" loading="lazy" class="h-[240px] w-full rounded-[2px] object-cover lg:h-[330px]">
              <h3 class="text-[24px] font-extrabold leading-[1.22] tracking-[-0.029em] text-ink">
                Santika Premiere Dyandra Hotel &amp; Convention
              </h3>
              <p class="text-[15px] leading-[1.7] text-prose">
                Jl. Kapten Maulana Lubis No. 7, Petisah Tengah, Medan 20112, North Sumatra, Indonesia
              </p>
            </div>

            <ul class="flex-1 border-t border-ink/16">
              <li v-for="t in TRAVEL" :key="t.title" class="flex gap-4 border-b border-ink/16 py-[22px]">
                <UIcon :name="t.icon" class="mt-0.5 size-[19px] shrink-0 text-navy" />
                <div class="flex flex-col gap-[7px]">
                  <h3 class="text-[18px] font-extrabold leading-[1.3] tracking-[-0.022em] text-ink">
                    {{ t.title }}
                  </h3>
                  <p class="text-[15px] leading-[1.72] text-prose">
                    {{ t.copy }}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="FAQ" title="QUESTIONS WE GET MOST." />

          <dl class="border-t border-ink/16">
            <div v-for="item in FAQ" :key="item.q" class="flex flex-col gap-3 border-b border-ink/16 py-[22px] lg:flex-row lg:gap-12">
              <dt class="text-[19px] font-extrabold leading-[1.3] tracking-[-0.026em] text-ink lg:w-[380px] lg:shrink-0">
                {{ item.q }}
              </dt>
              <dd class="text-[15px] leading-[1.75] text-prose">
                {{ item.a }}
              </dd>
            </div>
          </dl>
        </div>
      </SiteContainer>
    </section>

    <!-- Registration -->
    <section id="registration" class="bg-navy-deep py-20 lg:pb-[84px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-9">
          <SiteSectionHead eyebrow="REGISTRATION" title="SECURE YOUR PLACE IN MEDAN." dark>
            <template #action>
              <p class="flex items-center gap-2.5 text-[13px] font-bold text-white/80">
                <UIcon name="i-lucide-alarm-clock" class="size-[15px] text-gold" />
                Early rate ends 20 November 2026
              </p>
            </template>
          </SiteSectionHead>

          <ul class="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="p in PASSES" :key="p.name" class="flex flex-col gap-3 border-t-2 border-white/24 pt-[22px]">
              <span class="text-[13px] font-extrabold tracking-[0.085em] text-gold-soft">{{ p.name }}</span>
              <span class="text-[28px] font-extrabold leading-[1.2] tracking-[-0.036em] text-white">{{ p.price }}</span>
              <p class="text-[13px] leading-[1.65] text-white/60">
                {{ p.copy }}
              </p>
            </li>
          </ul>

          <div class="flex flex-col gap-6 border-t border-white/16 pt-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <p class="max-w-[620px] text-[15px] leading-[1.7] text-white/80">
              Groups of five or more receive a 15% rate and a reserved block in the country caucus. All rates exclude accommodation.
            </p>
            <div class="flex flex-wrap items-center gap-3">
              <SiteButton :to="registerHref" icon="i-lucide-arrow-right">
                Register now
              </SiteButton>
              <SiteButton :to="WHATSAPP_URL" variant="light">
                Request group rates
              </SiteButton>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
