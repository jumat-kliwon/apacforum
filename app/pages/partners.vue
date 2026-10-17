<script setup lang="ts">
import { AUDIENCE, HERO } from '~/data/home'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Partners',
  description: 'APCR is a regional platform at the intersection of business, government, communication and knowledge. Initiated by PR INDONESIA, with its strategic and media partners.',
  themeColor: '#031735'
})

const registerHref = await useRegisterHref('/apcr-2026#registration')

// the default event's partners from the CMS, one row per category
const { data: partners } = await useFetch('/api/public/partners', { query: { scope: 'event' }, default: () => [] })
const partnerGroups = computed(() => (Object.keys(PARTNER_CATEGORY) as (keyof typeof PARTNER_CATEGORY)[])
  .map(key => ({ key, label: PARTNER_CATEGORY[key].toUpperCase(), items: partners.value.filter(p => p.category === key) }))
  .filter(g => g.items.length))
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

    <!-- Partners: the default event's partners from the CMS, one row per category -->
    <section v-if="partnerGroups.length" id="partners" class="border-t border-ink/16 bg-white py-20 lg:pb-20 lg:pt-[76px]">
      <SiteContainer>
        <div class="flex flex-col gap-12">
          <div v-for="group in partnerGroups" :id="`partners-${group.key}`" :key="group.key" class="flex flex-col gap-6">
            <SiteEyebrow>
              {{ group.label }}
            </SiteEyebrow>
            <ul class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <li v-for="partner in group.items" :key="partner.id">
                <component
                  :is="partner.websiteUrl ? 'a' : 'div'"
                  :href="partner.websiteUrl ?? undefined"
                  :target="partner.websiteUrl ? '_blank' : undefined"
                  :rel="partner.websiteUrl ? 'noopener noreferrer' : undefined"
                  class="flex h-[104px] items-center justify-center rounded-[2px] border border-ink/16 bg-white px-4 py-3.5"
                  :class="{ 'transition-colors hover:border-ink/40': partner.websiteUrl }"
                >
                  <img v-if="partner.logoUrl" :src="partner.logoUrl" :alt="partner.name" loading="lazy" class="max-h-full max-w-full object-contain">
                  <span v-else class="text-center text-[11px] font-extrabold uppercase tracking-[0.073em] text-[#7c8695]">{{ partner.name }}</span>
                </component>
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
          </div>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
