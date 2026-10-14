<script setup lang="ts">
import {
  CONSTITUENCIES, DAYS, ECOSYSTEM, EDITION_FACTS, FEATURED_INSIGHT, HERO,
  INSIGHTS, PARTNERS, PRESSURES, PROGRAMMES, PROGRESSION, STORIES
} from '~/data/home'
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'APCR — ASEAN Public Communication & Reputation Forum',
  titleTemplate: null,
  description: HERO.blurb,
  themeColor: '#031735'
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-navy-deep">
      <img
        src="/landing/networking.webp"
        alt=""
        width="1100"
        height="825"
        fetchpriority="high"
        class="absolute inset-0 size-full object-cover"
      >
      <div class="absolute inset-0" style="background: linear-gradient(to right, #031735f7 0%, #031735eb 50%, #03173599 100%)" />

      <SiteContainer>
        <div class="relative flex min-h-[560px] flex-col justify-center gap-[26px] py-20 lg:min-h-[716px]">
          <SiteEyebrow dark>
            {{ HERO.eyebrow }}
          </SiteEyebrow>

          <h1 class="text-[clamp(38px,6.4vw,76.8px)] font-extrabold leading-[0.96] tracking-[-0.055em] text-white">
            <template v-for="(line, i) in HERO.title" :key="line">
              {{ line }}<br v-if="i < HERO.title.length - 1">
            </template>
          </h1>

          <div class="flex flex-wrap items-center gap-3.5 text-white">
            <p class="text-[19px] font-extrabold">
              {{ HERO.date }}
            </p>
            <span class="hidden h-4 w-px bg-white/35 sm:block" />
            <p class="text-[17px] text-white/85">
              {{ HERO.location }}
            </p>
          </div>

          <p class="max-w-[790px] text-[19px] leading-[1.65] text-white/85">
            {{ HERO.blurb }}
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-2.5">
            <NuxtLink
              to="/apcr-2026"
              class="inline-flex items-center gap-2 rounded-[2px] bg-gold-soft px-6 py-4 text-[12px] font-extrabold tracking-[0.067em] text-navy-deep transition-colors hover:bg-white"
            >
              EXPLORE APCR 2026
              <UIcon name="i-lucide-arrow-right" class="size-[15px]" />
            </NuxtLink>
            <a
              :href="WHATSAPP_URL"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center rounded-[2px] border border-white/40 px-6 py-4 text-[12px] font-extrabold tracking-[0.067em] text-white transition-colors hover:bg-white/10"
            >
              BECOME A PARTNER
            </a>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Why APCR -->
    <section id="about" class="py-20 lg:pb-20 lg:pt-[88px]">
      <SiteContainer>
        <div class="flex flex-col gap-9">
          <div class="flex flex-col gap-[22px]">
            <SiteEyebrow>WHY APCR</SiteEyebrow>
            <h2 class="text-[clamp(30px,4.6vw,54px)] font-extrabold leading-[1.04] tracking-[-0.045em] text-ink">
              APCR IS NOT A CONFERENCE.<br>IT IS REGIONAL TRUST INFRASTRUCTURE.
            </h2>
          </div>

          <div class="grid gap-8 lg:grid-cols-2 lg:gap-14">
            <p class="text-[19px] leading-[1.72] text-ink">
              ASEAN is more connected than it has ever been — through trade, investment, technology, data, tourism and people. That same connectivity moves reputational risk across borders in hours.
            </p>
            <p class="text-[17px] leading-[1.75] text-prose">
              APCR exists so the region does not meet those moments unprepared. The December forum is the visible part; underneath it sits a framework, a research engine and a community that work through the whole year.
            </p>
          </div>

          <ul class="grid gap-7 pt-3 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="(item, i) in ECOSYSTEM" :key="item.title" class="flex flex-col gap-3 border-t border-ink/16 pt-5">
              <span class="text-[13px] font-extrabold tracking-[0.09em] text-gold">{{ String(i + 1).padStart(2, '0') }}</span>
              <h3 class="text-[19px] font-extrabold leading-[1.25] tracking-[-0.026em] text-ink">
                {{ item.title }}
              </h3>
              <p class="text-[14px] leading-[1.7] text-prose">
                {{ item.copy }}
              </p>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Policy × Business × Communication -->
    <section class="bg-navy-deep py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <div class="flex flex-col gap-[22px]">
            <SiteEyebrow dark>
              WHERE THE REGION MEETS
            </SiteEyebrow>
            <h2 class="text-[clamp(28px,4.2vw,50px)] font-extrabold leading-[1.06] tracking-[-0.042em] text-white">
              POLICY × BUSINESS × COMMUNICATION
            </h2>
            <p class="max-w-[860px] text-[18px] leading-[1.7] text-white/80">
              Trust is never built by one sector alone. APCR is deliberately designed as the room where the three that shape it sit at the same table.
            </p>
          </div>

          <div class="flex flex-col gap-10 pt-3.5 lg:flex-row lg:gap-0">
            <template v-for="(col, i) in CONSTITUENCIES" :key="col.title">
              <!-- The × is decoration between columns, so it is hidden where they stack. -->
              <div v-if="i > 0" aria-hidden="true" class="hidden w-[72px] shrink-0 justify-center pt-7 lg:flex">
                <span class="text-[30px] font-extrabold text-gold">×</span>
              </div>
              <div class="flex flex-1 flex-col gap-3.5 border-t-2 border-white/24 pt-6">
                <h3 class="text-[26px] font-extrabold leading-[1.2] tracking-[-0.031em] text-white">
                  {{ col.title }}
                </h3>
                <p class="text-[15px] leading-[1.7] text-white/70">
                  {{ col.copy }}
                </p>
                <ul class="flex flex-col gap-2.5 pt-1.5">
                  <li v-for="who in col.who" :key="who" class="flex gap-2.5">
                    <span class="mt-2.5 size-[5px] shrink-0 rounded-full bg-gold" />
                    <span class="text-[13px] leading-[1.65] text-white/60">{{ who }}</span>
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- From Sumatra to ASEAN -->
    <section id="sumatra" class="border-y border-ink/16 bg-white py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <img
            src="/landing/medan-gateway.jpg"
            alt="A busy arterial road in Medan, North Sumatra"
            width="480"
            height="520"
            loading="lazy"
            class="h-[320px] w-full rounded-[2px] object-cover lg:h-[520px] lg:w-[480px] lg:shrink-0"
          >

          <div class="flex flex-1 flex-col gap-[22px]">
            <SiteEyebrow>FROM SUMATRA TO ASEAN</SiteEyebrow>
            <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
              WHY IT STARTS IN MEDAN.
            </h2>
            <p class="text-[17px] leading-[1.78] text-prose">
              North Sumatra is a working example of the region's story: a trading gateway with deep diaspora links, fast-moving investment and a public that holds institutions to account. Starting here keeps the agenda grounded in the places where trust is actually tested.
            </p>

            <ol class="pt-2.5">
              <li v-for="step in PROGRESSION" :key="step.place" class="flex flex-col gap-2 border-t border-ink/16 py-[18px] sm:flex-row sm:gap-5">
                <div class="flex items-baseline gap-2 sm:w-[118px] sm:shrink-0 sm:flex-col sm:gap-[3px]">
                  <span class="text-[14px] font-extrabold tracking-[0.079em] text-navy">{{ step.place }}</span>
                  <span class="text-[12px] text-prose-dim">{{ step.year }}</span>
                </div>
                <p class="text-[15px] leading-[1.7] text-prose">
                  {{ step.copy }}
                </p>
              </li>
            </ol>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- APCR 2026 -->
    <section id="apcr2026" class="bg-paper py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-[72px]">
            <div class="flex flex-col gap-5 lg:w-[640px] lg:shrink-0">
              <SiteEyebrow>APCR 2026</SiteEyebrow>
              <h2 class="text-[clamp(28px,4vw,48px)] font-extrabold leading-[1.05] tracking-[-0.044em] text-ink">
                THREE DAYS IN MEDAN.
              </h2>
            </div>
            <p class="text-[16px] leading-[1.75] text-prose">
              The 2026 edition runs as one argument across three days: understand the stakes, build the practice, commit to action.
            </p>
          </div>

          <div class="flex flex-col gap-10 lg:flex-row lg:gap-10">
            <ol class="flex-1 border-t border-ink/16">
              <li v-for="day in DAYS" :key="day.day" class="flex flex-col gap-3 border-b border-ink/16 py-6 sm:flex-row sm:gap-7">
                <div class="flex items-baseline gap-2 sm:w-[120px] sm:shrink-0 sm:flex-col sm:gap-1">
                  <span class="text-[12px] font-extrabold tracking-[0.1em] text-gold">{{ day.day }}</span>
                  <span class="text-[13px] text-prose">{{ day.date }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  <h3 class="text-[24px] font-extrabold leading-[1.2] tracking-[-0.029em] text-ink">
                    {{ day.title }}
                  </h3>
                  <p class="text-[15px] leading-[1.7] text-prose">
                    {{ day.copy }}
                  </p>
                </div>
              </li>
            </ol>

            <aside class="flex flex-col gap-5 rounded-[2px] bg-navy-deep px-7 pb-[30px] pt-7 lg:w-[340px] lg:shrink-0">
              <p class="text-[11px] font-extrabold tracking-[0.118em] text-gold-soft">
                THE 2026 EDITION
              </p>
              <ul>
                <li
                  v-for="(fact, i) in EDITION_FACTS"
                  :key="fact.label"
                  class="flex items-start gap-3"
                  :class="i > 0 && 'mt-4 border-t border-white/16 pt-4'"
                >
                  <UIcon :name="fact.icon" class="mt-0.5 size-4 shrink-0 text-gold-soft" />
                  <span class="text-[14px] font-bold leading-[1.6] text-white">{{ fact.label }}</span>
                </li>
              </ul>
              <NuxtLink
                to="/apcr-2026#registration"
                class="flex items-center justify-center gap-2 rounded-[2px] bg-gold-soft px-4 py-3.5 text-[12px] font-bold text-navy-deep transition-colors hover:bg-white"
              >
                Register for APCR 2026
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </NuxtLink>
            </aside>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Issues we focus on -->
    <section class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-[72px]">
            <div class="flex flex-col gap-5 lg:w-[640px] lg:shrink-0">
              <SiteEyebrow>ISSUES WE FOCUS ON</SiteEyebrow>
              <h2 class="text-[clamp(28px,3.9vw,46px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
                SIX PRESSURES ON REGIONAL TRUST.
              </h2>
            </div>
            <p class="text-[16px] leading-[1.75] text-prose">
              Every session, lab and research output at APCR traces back to one of these six. They are chosen because they cross borders — no single institution can answer them alone.
            </p>
          </div>

          <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="(issue, i) in PRESSURES"
              :key="issue.title"
              class="flex flex-col gap-3.5 rounded-[2px] border border-ink/16 bg-white px-[26px] pb-7 pt-[26px]"
            >
              <div class="flex items-center justify-between">
                <span class="text-[12px] font-extrabold tracking-[0.1em] text-gold">{{ String(i + 1).padStart(2, '0') }}</span>
                <UIcon :name="issue.icon" class="size-5 text-navy" />
              </div>
              <h3 class="text-[21px] font-extrabold leading-[1.2] tracking-[-0.029em] text-ink">
                {{ issue.title }}
              </h3>
              <p class="text-[14px] leading-[1.7] text-prose">
                {{ issue.copy }}
              </p>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Knowledge & insights -->
    <section id="knowledge" class="border-t border-ink/16 bg-white py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div class="flex flex-col gap-5 lg:w-[640px]">
              <SiteEyebrow>KNOWLEDGE &amp; INSIGHTS</SiteEyebrow>
              <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
                THE WORK CONTINUES BETWEEN EDITIONS.
              </h2>
            </div>
            <!-- The knowledge hub itself is not built yet. -->
            <p class="flex items-center gap-2 text-[13px] font-bold text-ink/35">
              Explore the knowledge hub
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </p>
          </div>

          <div class="flex flex-col gap-10 lg:flex-row lg:gap-12">
            <article class="flex flex-col gap-[18px] lg:w-[560px] lg:shrink-0">
              <img
                :src="FEATURED_INSIGHT.image"
                :alt="FEATURED_INSIGHT.alt"
                width="560"
                height="300"
                loading="lazy"
                class="h-[220px] w-full rounded-[2px] object-cover lg:h-[300px]"
              >
              <p class="text-[11px] font-extrabold tracking-[0.109em] text-navy">
                {{ FEATURED_INSIGHT.kicker }}
              </p>
              <h3 class="text-[27px] font-extrabold leading-[1.18] tracking-[-0.033em] text-ink">
                {{ FEATURED_INSIGHT.title }}
              </h3>
              <p class="text-[15px] leading-[1.72] text-prose">
                {{ FEATURED_INSIGHT.copy }}
              </p>
            </article>

            <ul class="flex-1 border-t border-ink/16">
              <li v-for="item in INSIGHTS" :key="item.title" class="flex items-start gap-5 border-b border-ink/16 py-5">
                <div class="flex flex-1 flex-col gap-2">
                  <span class="text-[11px] font-extrabold tracking-[0.109em] text-gold">{{ item.kind }}</span>
                  <h3 class="text-[17px] font-extrabold leading-[1.3] tracking-[-0.024em] text-ink">
                    {{ item.title }}
                  </h3>
                  <span class="text-[12px] text-prose-dim">{{ item.date }}</span>
                </div>
                <UIcon name="i-lucide-arrow-up-right" class="mt-1 size-4 shrink-0 text-navy" />
              </li>
            </ul>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Community -->
    <section id="community" class="bg-paper py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-[72px]">
            <div class="flex flex-col gap-5 lg:w-[660px] lg:shrink-0">
              <SiteEyebrow>COMMUNITY</SiteEyebrow>
              <h2 class="text-[clamp(28px,3.9vw,46px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
                APCR 365: THE YEAR BETWEEN EDITIONS.
              </h2>
            </div>
            <p class="text-[16px] leading-[1.75] text-prose">
              Four standing programmes keep the network working after Medan — closed-door rooms, clinics, curriculum and a pipeline of younger practitioners.
            </p>
          </div>

          <ul class="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="p in PROGRAMMES" :key="p.title" class="flex flex-col gap-3 border-t-2 border-ink/16 pt-[22px]">
              <UIcon :name="p.icon" class="size-[21px] text-navy" />
              <h3 class="text-[20px] font-extrabold leading-[1.22] tracking-[-0.025em] text-ink">
                {{ p.title }}
              </h3>
              <p class="text-[14px] leading-[1.7] text-prose">
                {{ p.copy }}
              </p>
              <p class="text-[12px] font-bold leading-[1.6] text-navy">
                {{ p.stat }}
              </p>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Partners -->
    <section id="partners" class="border-t border-ink/16 bg-white py-20 lg:pb-20 lg:pt-[76px]">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div class="flex flex-col gap-5 lg:w-[640px]">
              <SiteEyebrow>PARTNERS</SiteEyebrow>
              <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
                BUILT WITH THE INSTITUTIONS IT SERVES.
              </h2>
            </div>
            <a
              :href="WHATSAPP_URL"
              target="_blank"
              rel="noopener"
              class="inline-flex shrink-0 items-center gap-2 self-start lg:self-auto rounded-[2px] bg-navy px-5 py-3.5 text-[12px] font-bold text-white transition-colors hover:bg-navy-deep"
            >
              Become a partner
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </a>
          </div>

          <ul class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <li
              v-for="partner in PARTNERS"
              :key="partner.name"
              class="flex h-[104px] items-center justify-center rounded-[2px] border border-ink/16 bg-white px-4 py-3.5"
            >
              <img v-if="partner.logo" :src="partner.logo" :alt="partner.name" loading="lazy" class="max-h-full max-w-full object-contain">
              <span v-else class="text-center text-[11px] font-extrabold uppercase tracking-[0.073em] text-[#7c8695]">{{ partner.name }}</span>
            </li>
          </ul>

          <div class="flex flex-wrap items-center justify-between gap-8 border-t border-ink/16 pt-5">
            <p class="text-[14px] text-prose">
              42 partner organisations across 10 ASEAN markets
            </p>
            <!-- A dedicated partners page is still to come. -->
            <p class="flex items-center gap-2 text-[13px] font-bold text-ink/35">
              See all partners
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Latest stories -->
    <section class="py-20 lg:pb-[92px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div class="flex flex-col gap-5 lg:w-[640px]">
              <SiteEyebrow>LATEST STORIES</SiteEyebrow>
              <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
                WHAT'S MOVING RIGHT NOW.
              </h2>
            </div>
            <NuxtLink to="/news" class="inline-flex shrink-0 items-center gap-2 self-start lg:self-auto text-[13px] font-bold text-navy hover:underline">
              All news &amp; media
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </NuxtLink>
          </div>

          <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <li v-for="story in STORIES" :key="story.title" class="flex flex-col overflow-hidden rounded-[2px] border border-ink/16 bg-white">
              <img :src="story.image" :alt="story.alt" width="360" height="188" loading="lazy" class="h-[188px] w-full object-cover">
              <div class="flex flex-1 flex-col gap-[11px] px-6 pb-6 pt-[22px]">
                <div class="flex items-center gap-2.5">
                  <span class="text-[12px] text-prose">{{ story.date }}</span>
                  <span class="size-[3px] rounded-full bg-ink/25" />
                  <span class="text-[11px] font-extrabold tracking-[0.1em] text-navy">{{ story.kind }}</span>
                </div>
                <h3 class="text-[19px] font-extrabold leading-[1.24] tracking-[-0.021em] text-ink">
                  {{ story.title }}
                </h3>
                <p class="text-[14px] leading-[1.62] text-prose">
                  {{ story.copy }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
