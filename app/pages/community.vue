<script setup lang="ts">
import { LEADERS_DIALOGUE, NEXT_GENERATION, YEAR_ROUND } from '~/data/community'
import { ECOSYSTEM, HERO } from '~/data/home'
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'APCR 365',
  description: 'Three days bring the community together. APCR 365 keeps the conversation going — connecting leaders, ideas and institutions around one common agenda: building a more trusted ASEAN.',
  themeColor: '#031735'
})

const registerHref = await useRegisterHref('/apcr-2026#registration')
</script>

<template>
  <div>
    <SiteHero
      eyebrow="APCR 365"
      title="THREE DAYS BRING THE COMMUNITY TOGETHER.&#10;APCR 365 KEEPS THE CONVERSATION GOING."
      blurb="APCR is not intended to end when the conference closes."
      title-class="text-[clamp(30px,4.6vw,54px)] leading-[1.04] tracking-[-0.045em]"
    />

    <!-- The APCR 365 ecosystem -->
    <section id="ecosystem" class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <SiteSectionHead eyebrow="THE APCR ECOSYSTEM" title="BUILDING A MORE TRUSTED ASEAN.">
            <template #intro>
              Throughout the year, APCR aims to connect leaders, ideas and institutions around one common agenda.
            </template>
          </SiteSectionHead>

          <div class="flex flex-col gap-5 border-t border-ink/16 pt-7">
            <p class="text-[17px] leading-[1.7] text-prose">
              The annual forum is the meeting point of a wider ecosystem involving:
            </p>
            <ul class="flex flex-wrap gap-2.5">
              <li v-for="item in ECOSYSTEM" :key="item" class="rounded-[2px] bg-paper px-3.5 py-2.5 text-[12px] font-extrabold tracking-[0.1em] text-navy">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Throughout the year -->
    <section id="programmes" class="bg-paper py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <SiteSectionHead eyebrow="THROUGHOUT THE YEAR" title="BEYOND THE ANNUAL FORUM." />

          <div class="grid gap-6 md:grid-cols-2">
            <article
              v-for="(p, i) in YEAR_ROUND"
              :id="p.id"
              :key="p.id"
              class="flex scroll-mt-[90px] flex-col gap-3.5 rounded-[2px] border border-ink/16 bg-white px-[26px] pb-7 pt-[26px]"
            >
              <span class="text-[12px] font-extrabold tracking-[0.1em] text-gold">{{ String(i + 1).padStart(2, '0') }}</span>
              <h2 class="text-[clamp(21px,2.2vw,26px)] font-extrabold leading-[1.2] tracking-[-0.029em] text-ink">
                {{ p.title }}
              </h2>
              <p class="text-[15px] leading-[1.7] text-prose">
                {{ p.copy }}
              </p>
            </article>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Next generation -->
    <section id="next-generation" class="bg-navy-deep py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div class="flex flex-col gap-6 lg:w-[520px] lg:shrink-0">
            <SiteEyebrow dark>
              {{ NEXT_GENERATION.title }}
            </SiteEyebrow>
            <h2 class="text-[clamp(27px,3.5vw,42px)] font-extrabold leading-[1.08] tracking-[-0.043em] text-white">
              {{ LEADERS_DIALOGUE.details?.[0] }}
            </h2>
            <p class="text-[16px] leading-[1.75] text-white/80">
              {{ NEXT_GENERATION.items.join(' • ') }}
            </p>
          </div>

          <div class="flex flex-1 flex-col gap-4 border-t-2 border-white/24 pt-6 lg:border-l-2 lg:border-t-0 lg:pl-[26px] lg:pt-1.5">
            <p class="text-[11px] font-extrabold tracking-[0.118em] text-gold-soft">
              {{ LEADERS_DIALOGUE.when }}
            </p>
            <h3 class="text-[22px] font-extrabold leading-[1.25] tracking-[-0.027em] text-white">
              {{ LEADERS_DIALOGUE.title }}
            </h3>
            <ul class="flex flex-col gap-2.5">
              <li v-for="item in LEADERS_DIALOGUE.issues" :key="item" class="flex gap-2.5">
                <span class="mt-2.5 size-[5px] shrink-0 rounded-full bg-gold" />
                <span class="text-[15px] leading-[1.65] text-white/80">{{ item }}</span>
              </li>
            </ul>
            <p class="border-t border-white/16 pt-4 text-[13px] text-white/60">
              Speakers: TBC
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Closing call to action -->
    <section class="bg-paper py-16 lg:pb-[68px] lg:pt-16">
      <SiteContainer>
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div class="flex flex-col gap-3 lg:w-[660px]">
            <h2 class="text-[clamp(24px,2.9vw,34px)] font-extrabold leading-[1.12] tracking-[-0.038em] text-ink">
              JOIN THE CONVERSATION.
            </h2>
            <p class="text-[16px] leading-[1.68] text-prose">
              {{ HERO.date }} · {{ HERO.location }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <SiteButton :to="WHATSAPP_URL" variant="navy" icon="i-lucide-arrow-right">
              CONTACT VIA WHATSAPP
            </SiteButton>
            <SiteButton :to="registerHref" variant="dark">
              REGISTER FOR APCR 2026
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
