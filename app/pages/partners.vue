<script setup lang="ts">
import { ACADEMIC_HOME, BENEFITS, PARTNER_GROUPS, STEPS } from '~/data/partners'
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Partners',
  description: 'APCR works with organizations that share our commitment to building trust, strengthening reputation and advancing collaboration across ASEAN.',
  themeColor: '#031735'
})

const pad = (i: number) => String(i + 1).padStart(2, '0')
</script>

<template>
  <div>
    <SiteHero
      eyebrow="PARTNERS"
      title="BUILDING THE ASEAN TRUST ECOSYSTEM TOGETHER."
      blurb="APCR works with organizations that share our commitment to building trust, strengthening reputation and advancing collaboration across ASEAN."
      title-class="text-[clamp(32px,4.9vw,58px)] leading-[1.02] tracking-[-0.045em]"
    >
      <template #actions>
        <SiteButton :to="WHATSAPP_URL" icon="i-lucide-arrow-right">
          Become a partner
        </SiteButton>
        <SiteButton variant="light" icon="i-lucide-arrow-down">
          Download prospectus
        </SiteButton>
      </template>
    </SiteHero>

    <!-- Our partners -->
    <section class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <SiteSectionHead eyebrow="OUR PARTNERS" title="SEVEN KINDS OF PARTNERSHIP.">
            <template #intro>
              Each category contributes something the forum cannot produce on its own — a mandate, a market, a method or a channel.
            </template>
          </SiteSectionHead>

          <div class="flex flex-col gap-8 rounded-[2px] border border-ink/16 bg-white px-9 py-8 lg:flex-row lg:items-center lg:gap-10">
            <div class="flex h-[132px] w-full items-center justify-center rounded-[2px] border border-ink/16 bg-paper-soft px-5 py-4 lg:w-[280px] lg:shrink-0">
              <span class="text-center text-[13px] font-extrabold uppercase tracking-[0.069em] text-[#7c8695]">{{ ACADEMIC_HOME.tile }}</span>
            </div>
            <div class="flex flex-1 flex-col gap-3">
              <span class="text-[11px] font-extrabold tracking-[0.118em] text-gold">{{ ACADEMIC_HOME.kicker }}</span>
              <h3 class="text-[26px] font-extrabold leading-[1.2] tracking-[-0.031em] text-ink">
                {{ ACADEMIC_HOME.title }}
              </h3>
              <p class="text-[15px] leading-[1.72] text-prose">
                {{ ACADEMIC_HOME.copy }}
              </p>
            </div>
          </div>

          <div v-for="group in PARTNER_GROUPS" :key="group.label" class="flex flex-col gap-4 border-t border-ink/16 pb-2 pt-[22px]">
            <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <h3 class="text-[12px] font-extrabold tracking-[0.108em] text-navy">
                {{ group.label }}
              </h3>
              <p class="text-[13px] text-prose">
                {{ group.note }}
              </p>
            </div>
            <ul class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <li
                v-for="tile in group.tiles"
                :key="tile.name"
                class="flex h-[104px] items-center justify-center rounded-[2px] border border-ink/16 bg-white px-4 py-3.5"
              >
                <img v-if="tile.logo" :src="tile.logo" :alt="tile.name" loading="lazy" class="max-h-full max-w-full object-contain">
                <span v-else class="text-center text-[11px] font-extrabold uppercase tracking-[0.073em] text-[#7c8695]">{{ tile.name }}</span>
              </li>
            </ul>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Become a partner -->
    <section id="become" class="bg-paper py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <SiteSectionHead eyebrow="BECOME AN APCR PARTNER" title="WHAT PARTNERSHIP GIVES YOU." col-class="lg:w-[680px]">
            <template #intro>
              Partnership at APCR is a working relationship scoped against a part of the programme — not a logo placement.
            </template>
          </SiteSectionHead>

          <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <li v-for="(b, i) in BENEFITS" :key="b.title" class="flex flex-col gap-3 rounded-[2px] border border-ink/16 bg-white px-6 pb-[26px] pt-6">
              <div class="flex items-center justify-between">
                <UIcon :name="b.icon" class="size-5 text-navy" />
                <span class="text-[11px] font-extrabold tracking-[0.1em] text-gold">{{ pad(i) }}</span>
              </div>
              <h3 class="text-[20px] font-extrabold leading-[1.2] tracking-[-0.025em] text-ink">
                {{ b.title }}
              </h3>
              <p class="text-[14px] leading-[1.68] text-prose">
                {{ b.copy }}
              </p>
            </li>
          </ul>

          <ol class="grid gap-8 pt-3 md:grid-cols-3">
            <li v-for="(s, i) in STEPS" :key="s.title" class="flex flex-col gap-3 border-t border-ink/16 pt-5">
              <span class="text-[13px] font-extrabold tracking-[0.09em] text-gold">{{ pad(i) }}</span>
              <h3 class="text-[19px] font-extrabold leading-[1.25] tracking-[-0.026em] text-ink">
                {{ s.title }}
              </h3>
              <p class="text-[15px] leading-[1.7] text-prose">
                {{ s.copy }}
              </p>
            </li>
          </ol>
        </div>
      </SiteContainer>
    </section>

    <!-- Closing call to action -->
    <section class="bg-navy-deep py-16 lg:pb-[68px] lg:pt-16">
      <SiteContainer>
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div class="flex flex-col gap-3.5 lg:w-[620px]">
            <h2 class="text-[clamp(26px,3.2vw,38px)] font-extrabold leading-[1.1] tracking-[-0.039em] text-white">
              LET'S SCOPE A PARTNERSHIP.
            </h2>
            <p class="text-[16px] leading-[1.6] text-white/80">
              Partnership team ·
              <a href="mailto:partners@apcrforum.org" class="underline underline-offset-2">partners@apcrforum.org</a>
              · +62 21 5050 1026
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <SiteButton to="mailto:partners@apcrforum.org" icon="i-lucide-arrow-down">
              Request prospectus
            </SiteButton>
            <SiteButton :to="WHATSAPP_URL" variant="light" icon="i-lucide-calendar">
              Book a call
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
