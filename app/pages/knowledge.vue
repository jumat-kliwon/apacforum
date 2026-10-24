<script setup lang="ts">
import { HERO, OUTPUTS } from '~/data/home'
import { KNOWLEDGE_DAY, RESEARCH_OUTLOOK, TRUST_FRAMEWORK } from '~/data/knowledge'
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Knowledge',
  description: 'From conversation to knowledge. From connection to collaboration. APCR is designed to move beyond conference conversations.',
  themeColor: '#031735'
})

const registerHref = await useRegisterHref('/apcr-2026#registration')
</script>

<template>
  <div>
    <SiteHero
      eyebrow="APCR KNOWLEDGE"
      title="FROM CONVERSATION TO KNOWLEDGE.&#10;FROM CONNECTION TO COLLABORATION."
      blurb="APCR is designed to move beyond conference conversations."
      title-class="text-[clamp(30px,4.6vw,54px)] leading-[1.04] tracking-[-0.045em]"
    />

    <!-- What APCR should produce -->
    <section id="research" class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <SiteSectionHead eyebrow="WHAT APCR SHOULD PRODUCE" title="THE ECOSYSTEM WILL PROGRESSIVELY DEVELOP" />

          <ul class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="(o, i) in OUTPUTS" :key="o.title" class="flex flex-col gap-3 border-t-2 border-ink/16 pt-[22px]">
              <span class="text-[13px] font-extrabold tracking-[0.09em] text-gold">{{ String(i + 1).padStart(2, '0') }}</span>
              <h3 class="text-[20px] font-extrabold leading-[1.22] tracking-[-0.025em] text-ink">
                {{ o.title }}
              </h3>
              <p class="text-[14px] leading-[1.7] text-prose">
                {{ o.copy }}
              </p>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- APCR Research & Outlook -->
    <section id="outlook" class="bg-paper py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div class="flex flex-col gap-[22px] lg:w-[460px] lg:shrink-0">
            <SiteEyebrow>APCR RESEARCH &amp; OUTLOOK</SiteEyebrow>
            <h2 class="text-[clamp(26px,3.4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.04em] text-ink">
              APCR RESEARCH &amp; OUTLOOK 2027
            </h2>
            <p class="text-[17px] leading-[1.78] text-prose">
              {{ RESEARCH_OUTLOOK.output.copy }}
            </p>
          </div>

          <div class="flex flex-1 flex-col gap-4 rounded-[2px] border border-ink/16 bg-white px-[26px] pb-7 pt-6">
            <p class="text-[11px] font-extrabold tracking-[0.118em] text-gold">
              {{ RESEARCH_OUTLOOK.session.when }}
            </p>
            <h3 class="text-[13px] font-extrabold tracking-[0.1em] text-navy">
              {{ RESEARCH_OUTLOOK.session.title }}
            </h3>
            <template v-for="(d, i) in RESEARCH_OUTLOOK.session.details" :key="d">
              <p v-if="i === 0" class="text-[clamp(22px,2.6vw,30px)] font-extrabold leading-[1.2] tracking-[-0.03em] text-ink">
                {{ d }}
              </p>
              <p v-else class="text-[16px] leading-[1.7] text-prose">
                {{ d }}
              </p>
            </template>
            <p class="border-t border-ink/16 pt-4 text-[13px] leading-[1.6] text-prose-dim">
              Speakers: {{ RESEARCH_OUTLOOK.session.speakers?.join(' · ') ?? 'TBC' }}
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- ASEAN Trust & Reputation Framework -->
    <section id="framework" class="bg-navy-deep py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <SiteSectionHead eyebrow="ASEAN TRUST &amp; REPUTATION FRAMEWORK" :title="TRUST_FRAMEWORK.session.details?.[0] ?? ''" dark>
            <template #intro>
              {{ TRUST_FRAMEWORK.output.copy }}
            </template>
          </SiteSectionHead>

          <div class="flex flex-col gap-2 border-t border-white/16 pt-6">
            <p class="text-[11px] font-extrabold tracking-[0.118em] text-gold-soft">
              {{ TRUST_FRAMEWORK.session.when }} · {{ TRUST_FRAMEWORK.session.title }}
            </p>
            <p v-for="d in TRUST_FRAMEWORK.session.details?.slice(1)" :key="d" class="text-[20px] font-extrabold leading-[1.3] tracking-[-0.025em] text-white">
              {{ d }}
            </p>
          </div>

          <ol v-if="TRUST_FRAMEWORK.session.issues" class="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="(q, i) in TRUST_FRAMEWORK.session.issues" :key="q" class="flex flex-col gap-3 border-t-2 border-white/24 pt-[22px]">
              <span class="text-[13px] font-extrabold tracking-[0.09em] text-gold-soft">{{ String(i + 1).padStart(2, '0') }}</span>
              <p class="text-[18px] font-extrabold leading-[1.3] tracking-[-0.02em] text-white">
                {{ q }}
              </p>
            </li>
          </ol>

          <p class="text-[13px] leading-[1.6] text-white/60">
            Speakers: {{ TRUST_FRAMEWORK.session.speakers?.join(' · ') ?? 'TBC' }}
          </p>
        </div>
      </SiteContainer>
    </section>

    <!-- Day 3: ASEAN Knowledge, Trust & Reputation Forum -->
    <section id="forum" class="py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div class="flex max-w-[820px] flex-col gap-5">
            <SiteEyebrow>{{ KNOWLEDGE_DAY.date }}</SiteEyebrow>
            <p class="text-[13px] font-extrabold tracking-[0.1em] text-gold">
              {{ KNOWLEDGE_DAY.question }}
            </p>
            <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
              {{ KNOWLEDGE_DAY.name }}
            </h2>
            <p class="text-[14px] font-extrabold tracking-[0.079em] text-navy">
              {{ KNOWLEDGE_DAY.theme }}
            </p>
            <p class="text-[17px] leading-[1.78] text-prose">
              {{ KNOWLEDGE_DAY.summary }}
            </p>
            <p class="text-[13px] text-prose-dim">
              Speakers and institutional participation: TBC.
            </p>
          </div>
          <SiteButton to="/apcr-2026#programme" variant="navy" icon="i-lucide-arrow-right" class="shrink-0 self-start lg:self-auto">
            VIEW THE PROGRAMME
          </SiteButton>
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
            <SiteButton :to="registerHref" variant="navy" icon="i-lucide-arrow-right">
              REGISTER FOR APCR 2026
            </SiteButton>
            <SiteButton :to="WHATSAPP_URL" variant="dark">
              CONTACT VIA WHATSAPP
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
