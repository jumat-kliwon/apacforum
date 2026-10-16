<script setup lang="ts">
import { AUDIENCE, HERO } from '~/data/home'
import { PROGRAMME } from '~/data/programme-rundown'
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'APCR 2026',
  description: `Three days. Three questions. One trust ecosystem. ASEAN Public Communication & Reputation Forum 2026, ${HERO.date}, ${HERO.location}.`,
  themeColor: '#031735'
})

const registerHref = await useRegisterHref()

/** The Day 2 cultural programme, which is all the landing says about the city itself. */
const CULTURAL_DAY = PROGRAMME.find(d => d.id === 'day2')!
const CULTURAL = CULTURAL_DAY.rows.find(r => r.title === 'APCR Medan Cultural Experience')!

// the default event's published speakers from the CMS; the sector filter shows once there are two sectors
const { data: speakers } = await useFetch('/api/public/speakers', { default: () => [] })
const speakerFilters = computed(() => (Object.keys(SPEAKER_CATEGORY) as (keyof typeof SPEAKER_CATEGORY)[])
  .filter(key => speakers.value.some(s => s.category === key)))
const speakerFilter = ref<keyof typeof SPEAKER_CATEGORY | null>(null)
const visibleSpeakers = computed(() => speakerFilter.value
  ? speakers.value.filter(s => s.category === speakerFilter.value)
  : speakers.value)
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-navy-deep">
      <img src="/landing/city.webp" alt="" width="1100" height="825" fetchpriority="high" class="absolute inset-0 size-full object-cover">
      <div class="absolute inset-0" style="background: linear-gradient(to right, #031735f7 0%, #031735eb 50%, #03173599 100%)" />

      <SiteContainer>
        <div class="relative flex min-h-[520px] flex-col justify-center gap-6 py-20 lg:min-h-[648px]">
          <SiteEyebrow dark>
            {{ HERO.eyebrow }}
          </SiteEyebrow>
          <h1 class="text-[clamp(40px,6.6vw,78px)] font-extrabold leading-[0.98] tracking-[-0.051em] text-white">
            THREE DAYS.<br>THREE QUESTIONS.<br>ONE TRUST ECOSYSTEM.
          </h1>
          <div class="flex flex-wrap items-center gap-3.5">
            <p class="text-[19px] font-extrabold text-gold-soft">
              {{ HERO.date }}
            </p>
            <span class="hidden h-4 w-px bg-white/35 sm:block" />
            <p class="text-[18px] text-white/85">
              {{ HERO.location }}
            </p>
          </div>
          <p class="max-w-[800px] text-[19px] leading-[1.65] text-white/85">
            {{ HERO.copy[1] }}
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
    <section id="overview" class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-9">
          <SiteSectionHead eyebrow="OVERVIEW" title="THE THREE-DAY APCR JOURNEY." />

          <ul class="grid gap-6 lg:grid-cols-3">
            <li v-for="day in PROGRAMME" :key="day.id" class="flex flex-col gap-3.5 rounded-[2px] border border-ink/16 bg-white px-[26px] pb-7 pt-[26px]">
              <span class="text-[12px] font-extrabold tracking-[0.108em] text-gold">{{ day.date }}</span>
              <h3 class="text-[26px] font-extrabold leading-[1.15] tracking-[-0.035em] text-ink">
                {{ day.question }}
              </h3>
              <p class="text-[16px] font-extrabold leading-[1.35] tracking-[-0.01em] text-navy">
                {{ day.name }}
              </p>
              <p class="text-[11px] font-extrabold leading-[1.5] tracking-[0.1em] text-prose">
                {{ day.theme }}
              </p>
              <p class="text-[15px] leading-[1.68] text-prose">
                {{ day.summary }}
              </p>
            </li>
          </ul>

          <div class="flex flex-col items-center gap-5 rounded-[2px] bg-navy-deep px-9 pb-11 pt-10">
            <p class="text-center text-[11px] font-extrabold tracking-[0.127em] text-gold-soft">
              THE APCR TRUST FRAMEWORK
            </p>
            <p class="flex flex-wrap items-center justify-center gap-5 text-center text-[clamp(22px,3.4vw,34px)] font-extrabold tracking-[-0.012em] text-white">
              BUILD TRUST <UIcon name="i-lucide-arrow-right" class="size-[22px] text-gold" />
              CREATE VALUE <UIcon name="i-lucide-arrow-right" class="size-[22px] text-gold" />
              PROTECT TRUST
            </p>
            <p class="flex flex-wrap items-center justify-center gap-5 text-center text-[clamp(16px,2.2vw,22px)] font-extrabold tracking-[0.027em] text-white/70">
              BUILD <UIcon name="i-lucide-arrow-right" class="size-[18px] text-gold" />
              CREATE VALUE <UIcon name="i-lucide-arrow-right" class="size-[18px] text-gold" />
              PROTECT <UIcon name="i-lucide-arrow-right" class="size-[18px] text-gold" />
              REBUILD
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Programme -->
    <section id="programme" class="border-t border-ink/16 bg-white py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <SiteSectionHead eyebrow="PROGRAMME" title="THE APCR 2026 PROGRAMME." />

          <SiteProgrammeRundown />
        </div>
      </SiteContainer>
    </section>

    <!-- Speakers -->
    <section id="speakers" class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="SPEAKERS" title="SPEAKERS AND INSTITUTIONAL PARTICIPATION." size="md" col-class="lg:w-[700px]" />

          <template v-if="speakers.length">
            <div v-if="speakerFilters.length > 1" class="flex flex-col gap-4 border-b border-ink/16 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div class="flex flex-wrap gap-2" role="group" aria-label="Filter speakers by sector">
                <button
                  v-for="f in [null, ...speakerFilters]"
                  :key="f ?? 'all'"
                  type="button"
                  class="rounded-[2px] px-3.5 py-2.5 text-[12px] font-bold transition-colors"
                  :class="speakerFilter === f ? 'bg-navy text-white' : 'border border-ink/16 text-prose hover:border-ink/35'"
                  :aria-pressed="speakerFilter === f"
                  @click="speakerFilter = f"
                >
                  {{ f ? SPEAKER_CATEGORY[f] : 'All' }}
                </button>
              </div>
              <p class="text-[13px] text-prose-dim">
                {{ visibleSpeakers.length }} of {{ speakers.length }} speakers
              </p>
            </div>

            <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <li v-for="s in visibleSpeakers" :key="s.id" class="flex flex-col overflow-hidden rounded-[2px] border border-ink/16 bg-white">
                <img v-if="s.photoUrl" :src="s.photoUrl" :alt="s.name" width="257" height="244" loading="lazy" class="h-[244px] w-full object-cover">
                <div v-else class="flex h-[244px] items-center justify-center bg-paper text-[40px] font-extrabold tracking-[-0.03em] text-ink/25" aria-hidden="true">
                  {{ s.name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() }}
                </div>
                <div class="flex flex-1 flex-col gap-2 px-5 pb-[22px] pt-5">
                  <span class="text-[10px] font-extrabold tracking-[0.11em] text-gold">{{ SPEAKER_CATEGORY[s.category].toUpperCase() }}</span>
                  <h3 class="text-[17px] font-extrabold leading-[1.25] tracking-[-0.018em] text-ink">
                    {{ s.name }}
                  </h3>
                  <p class="text-[13px] text-prose">
                    {{ s.title }}
                  </p>
                  <p v-if="s.dayLabel" class="mt-auto text-[12px] text-prose-dim">
                    {{ s.dayLabel }}
                  </p>
                </div>
              </li>
            </ul>
          </template>

          <div v-else class="flex flex-col gap-3 border-l-2 border-gold pl-6">
            <p class="text-[clamp(20px,2.4vw,26px)] font-extrabold leading-[1.3] tracking-[-0.025em] text-ink">
              Speakers and institutional participation: TBC.
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Who should be in the room -->
    <section id="audience" class="bg-paper py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <SiteSectionHead eyebrow="WHO SHOULD ATTEND" title="WHO SHOULD BE IN THE ROOM?" />

          <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="group in AUDIENCE"
              :key="group.title"
              class="flex flex-col gap-3 rounded-[2px] border border-ink/16 bg-white px-[26px] pb-7 pt-[26px]"
            >
              <h3 class="text-[21px] font-extrabold leading-[1.2] tracking-[-0.029em] text-ink">
                {{ group.title }}
              </h3>
              <p class="text-[14px] leading-[1.75] text-prose">
                {{ group.items.join(' • ') }}
              </p>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Venue -->
    <section id="venue" class="border-t border-ink/16 bg-white py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <SiteSectionHead eyebrow="VENUE" :title="HERO.location.toUpperCase()" />

          <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
            <img
              src="/landing/medan.webp"
              alt="Professionals walking through Medan heritage district"
              width="480"
              height="520"
              loading="lazy"
              class="h-[320px] w-full rounded-[2px] object-cover lg:h-[520px] lg:w-[480px] lg:shrink-0"
            >

            <div class="flex flex-1 flex-col gap-[22px]">
              <SiteEyebrow>FROM SUMATRA TO ASEAN</SiteEyebrow>
              <h3 class="text-[clamp(24px,3vw,34px)] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink">
                WHY MEDAN? WHY SUMATRA?
              </h3>
              <p class="text-[17px] leading-[1.78] text-prose">
                APCR begins in Medan with a simple belief:
              </p>
              <p class="text-[19px] font-bold leading-[1.6] text-ink">
                Strong ASEAN collaboration can grow from strong regions.
              </p>
              <p class="text-[17px] leading-[1.78] text-prose">
                Sumatra sits strategically close to some of ASEAN's major economic centres and possesses significant assets in energy, agriculture, plantations, tourism, finance, logistics, culture and human capital.
              </p>
              <div class="flex flex-col gap-2 border-y border-ink/16 py-5">
                <p class="text-[13px] text-prose">
                  APCR wants to create a bridge:
                </p>
                <p class="text-[16px] font-extrabold tracking-[0.079em] text-navy">
                  SUMATRA → INDONESIA → ASEAN
                </p>
              </div>
              <p class="text-[17px] leading-[1.78] text-prose">
                Not merely to promote Sumatra, but to connect its leaders, institutions, businesses, ideas and opportunities with the wider ASEAN ecosystem.
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3 rounded-[2px] border border-ink/16 bg-paper px-[26px] pb-7 pt-[26px]">
            <span class="text-[12px] font-extrabold tracking-[0.108em] text-gold">{{ CULTURAL_DAY.date }} · {{ CULTURAL.time }}</span>
            <h3 class="text-[24px] font-extrabold leading-[1.22] tracking-[-0.029em] text-ink">
              {{ CULTURAL.title }}
            </h3>
            <p v-for="line in CULTURAL.details" :key="line" class="text-[15px] leading-[1.7] text-prose">
              {{ line }}
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Registration -->
    <section id="registration" class="bg-navy-deep py-20 lg:py-[96px]">
      <SiteContainer>
        <div class="flex flex-col items-start gap-[26px]">
          <h2 class="max-w-[980px] text-[clamp(28px,4.2vw,50px)] font-extrabold leading-[1.06] tracking-[-0.042em] text-white">
            ASEAN IS BECOMING MORE CONNECTED.
          </h2>
          <p class="max-w-[860px] text-[19px] leading-[1.65] text-white/85">
            The next challenge is making sure it also becomes more trusted.
          </p>

          <div class="flex w-full flex-col gap-3 border-t border-white/16 pt-8">
            <h3 class="text-[22px] font-extrabold tracking-[-0.025em] text-gold-soft">
              JOIN THE CONVERSATION.
            </h3>
            <p class="text-[13px] font-extrabold tracking-[0.1em] text-white">
              ASEAN PUBLIC COMMUNICATION &amp; REPUTATION FORUM (APCR) 2026
            </p>
            <div class="flex flex-wrap items-center gap-3.5 text-white">
              <p class="text-[17px] font-extrabold">
                {{ HERO.date }}
              </p>
              <span class="hidden h-4 w-px bg-white/35 sm:block" />
              <p class="text-[16px] text-white/85">
                {{ HERO.location }}
              </p>
            </div>
            <p class="text-[15px] text-white/70">
              Building Trust. Shaping Reputation. Connecting ASEAN.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <SiteButton :to="registerHref" size="lg" icon="i-lucide-arrow-right">
              REGISTER FOR APCR 2026
            </SiteButton>
            <SiteButton :to="WHATSAPP_URL" variant="light" size="lg">
              CONTACT VIA WHATSAPP
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
