<script setup lang="ts">
import { AUDIENCE, ECOSYSTEM, HERO, MEDIA_PARTNERS, STRATEGIC_PARTNERS } from '~/data/home'
import { PARTNERS } from '~/data/partners'
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Partners',
  description: 'APCR is a regional platform at the intersection of business, government, communication and knowledge. Initiated by PR INDONESIA, with its strategic and media partners.',
  themeColor: '#031735'
})

const registerHref = await useRegisterHref('/apcr-2026#registration')
</script>

<template>
  <div>
    <SiteHero
      eyebrow="PARTNERS"
      title="THE TRUST CHALLENGES FACING ASEAN REQUIRE AN ECOSYSTEM."
      blurb="APCR is a regional platform at the intersection of business, government, communication and knowledge — bringing together people who normally sit in different rooms."
      title-class="text-[clamp(32px,4.9vw,58px)] leading-[1.02] tracking-[-0.045em]"
    >
      <template #under>
        <p class="text-[14px] font-extrabold tracking-[0.079em] text-gold-soft">
          BUSINESS × GOVERNMENT × COMMUNICATION × KNOWLEDGE
        </p>
      </template>
      <template #actions>
        <SiteButton to="#become" icon="i-lucide-arrow-right">
          Become a partner
        </SiteButton>
        <SiteButton :to="WHATSAPP_URL" variant="light">
          Contact via WhatsApp
        </SiteButton>
      </template>
    </SiteHero>

    <!-- About the initiator -->
    <section id="initiator" class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div class="flex h-[200px] items-center justify-center rounded-[2px] border border-ink/16 bg-white px-10 lg:w-[360px] lg:shrink-0">
            <img src="/landing/pr-indonesia.png" alt="PR INDONESIA" width="150" height="122" loading="lazy" class="max-h-[120px] object-contain">
          </div>

          <div class="flex flex-1 flex-col gap-[22px]">
            <SiteEyebrow>ABOUT THE INITIATOR</SiteEyebrow>
            <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
              INITIATED BY PR INDONESIA
            </h2>
            <p class="text-[17px] leading-[1.78] text-prose">
              Established in 2015, PR INDONESIA is a communication and reputation ecosystem connecting corporations, government institutions, state-owned enterprises, universities, professional associations and communication leaders across Indonesia.
            </p>
            <p class="text-[17px] leading-[1.78] text-prose">
              Through APCR, PR INDONESIA is expanding that ecosystem:
            </p>
            <p class="text-[14px] font-extrabold leading-[1.8] tracking-[0.079em] text-navy">
              FROM NATIONAL COMMUNICATION ECOSYSTEM<br>TO ASEAN COMMUNICATION ECOSYSTEM.
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Partners -->
    <section id="partners" class="border-t border-ink/16 bg-white py-20 lg:pb-20 lg:pt-[76px]">
      <SiteContainer>
        <div class="flex flex-col gap-12">
          <div id="strategic-partners" class="flex flex-col gap-6">
            <SiteEyebrow>STRATEGIC PARTNERS</SiteEyebrow>
            <ul class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <li
                v-for="partner in STRATEGIC_PARTNERS"
                :key="partner.name"
                class="flex h-[120px] items-center justify-center rounded-[2px] border border-ink/16 bg-white px-4 py-3.5"
              >
                <img :src="partner.logo" :alt="partner.name" loading="lazy" class="max-h-full max-w-full object-contain">
              </li>
            </ul>
          </div>

          <div id="media-partners" class="flex flex-col gap-6">
            <SiteEyebrow>MEDIA PARTNER</SiteEyebrow>
            <ul class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <li
                v-for="partner in MEDIA_PARTNERS"
                :key="partner.name"
                class="flex h-[104px] items-center justify-center rounded-[2px] border border-ink/16 bg-white px-4 py-3.5"
              >
                <img :src="partner.logo" :alt="partner.name" loading="lazy" class="max-h-full max-w-full object-contain">
              </li>
            </ul>
          </div>

          <div id="partner" class="flex flex-col gap-6">
            <SiteEyebrow>PARTNER</SiteEyebrow>
            <ul class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <li
                v-for="partner in PARTNERS"
                :key="partner.name"
                class="flex h-[104px] items-center justify-center rounded-[2px] border border-ink/16 bg-white px-4 py-3.5"
              >
                <img :src="partner.logo" :alt="partner.name" loading="lazy" class="max-h-full max-w-full object-contain">
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
          <SiteSectionHead eyebrow="BECOME AN APCR PARTNER" title="BUILDING A MORE TRUSTED ASEAN." col-class="lg:w-[680px]">
            <template #intro>
              The trust challenges facing ASEAN cannot be solved by communication professionals alone. They require an ecosystem.
            </template>
          </SiteSectionHead>

          <div class="grid gap-8 lg:grid-cols-2 lg:gap-14">
            <div class="flex flex-col gap-4 border-t border-ink/16 pt-[22px]">
              <h3 class="text-[20px] font-extrabold leading-[1.2] tracking-[-0.025em] text-ink">
                Who should be in the room
              </h3>
              <ul class="flex flex-wrap gap-2.5">
                <li v-for="group in AUDIENCE" :key="group.title" class="rounded-[2px] bg-white px-[13px] py-2 text-[12px] font-extrabold tracking-[0.08em] text-navy">
                  {{ group.title }}
                </li>
              </ul>
            </div>

            <div class="flex flex-col gap-4 border-t border-ink/16 pt-[22px]">
              <h3 class="text-[20px] font-extrabold leading-[1.2] tracking-[-0.025em] text-ink">
                APCR 365
              </h3>
              <p class="text-[15px] leading-[1.7] text-prose">
                APCR is not intended to end when the conference closes. The annual forum is the meeting point of a wider ecosystem involving:
              </p>
              <ul class="flex flex-wrap gap-2.5">
                <li v-for="item in ECOSYSTEM" :key="item" class="rounded-[2px] bg-white px-[13px] py-2 text-[12px] font-extrabold tracking-[0.08em] text-navy">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <div>
            <SiteButton :to="WHATSAPP_URL" variant="navy" icon="i-lucide-arrow-right">
              Contact via WhatsApp
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Closing call to action -->
    <section class="bg-navy-deep py-16 lg:pb-[68px] lg:pt-16">
      <SiteContainer>
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div class="flex flex-col gap-3.5 lg:w-[620px]">
            <h2 class="text-[clamp(26px,3.2vw,38px)] font-extrabold leading-[1.1] tracking-[-0.039em] text-white">
              JOIN THE CONVERSATION.
            </h2>
            <p class="text-[16px] leading-[1.6] text-white/80">
              ASEAN Public Communication &amp; Reputation Forum (APCR) 2026 · {{ HERO.date }} · {{ HERO.location }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <SiteButton :to="registerHref" icon="i-lucide-arrow-right">
              Register for APCR 2026
            </SiteButton>
            <SiteButton :to="WHATSAPP_URL" variant="light">
              Contact via WhatsApp
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
