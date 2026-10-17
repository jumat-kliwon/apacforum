<script setup lang="ts">
import { INITIATOR, SUMATRA } from '~/data/about'
import { CONNECTIONS, FRAMEWORK, HERO, RISKS, STAKEHOLDERS, WHY_NOW } from '~/data/home'
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'About APCR',
  description: HERO.copy[1],
  themeColor: '#031735'
})

const registerHref = await useRegisterHref('/apcr-2026#registration')
</script>

<template>
  <div>
    <SiteHero
      eyebrow="ABOUT APCR"
      :title="HERO.positioning"
      :blurb="HERO.copy[0]"
    >
      <template #under>
        <p class="text-[17px] leading-[1.7] text-white/80">
          {{ HERO.copy[1] }}
        </p>
      </template>
      <template #actions>
        <SiteButton :to="registerHref" size="lg" icon="i-lucide-arrow-right">
          REGISTER NOW
        </SiteButton>
        <SiteButton to="/apcr-2026" variant="light" size="lg">
          EXPLORE APCR 2026
        </SiteButton>
      </template>
      <template #aside>
        <div class="flex flex-1 flex-col gap-4 border-l-2 border-white/24 py-1.5 pl-[26px]">
          <p class="text-[11px] font-extrabold tracking-[0.118em] text-gold-soft">
            APCR 2026
          </p>
          <p class="text-[28px] font-extrabold leading-[1.2] tracking-[-0.032em] text-white">
            {{ HERO.date }}
          </p>
          <p class="text-[15px] leading-[1.72] text-white/80">
            {{ HERO.location }}
          </p>
          <p class="border-t border-white/16 pt-4 text-[14px] leading-[1.72] text-white/70">
            Initiated by <strong class="font-extrabold text-white">PR INDONESIA</strong>
          </p>
        </div>
      </template>
    </SiteHero>

    <!-- Why APCR? Why now? -->
    <section id="why" class="py-20 lg:pb-20 lg:pt-[88px]">
      <SiteContainer>
        <div class="flex flex-col gap-9">
          <div class="flex flex-col gap-[22px]">
            <SiteEyebrow>WHY APCR? WHY NOW?</SiteEyebrow>
            <h2 class="max-w-[980px] text-[clamp(30px,4.6vw,54px)] font-extrabold leading-[1.04] tracking-[-0.045em] text-ink">
              A MORE CONNECTED ASEAN NEEDS A STRONGER TRUST ECOSYSTEM
            </h2>
          </div>

          <div class="grid gap-8 lg:grid-cols-2 lg:gap-14">
            <div class="flex flex-col gap-5">
              <p class="text-[19px] font-bold leading-[1.6] text-ink">
                {{ WHY_NOW.intro }}
              </p>
              <p class="text-[17px] leading-[1.75] text-prose">
                {{ WHY_NOW.context }}
              </p>
              <p class="text-[17px] leading-[1.75] text-prose">
                {{ WHY_NOW.turn }}
              </p>
            </div>
            <ul class="border-t border-ink/16">
              <li v-for="ex in WHY_NOW.examples" :key="ex" class="flex gap-3 border-b border-ink/16 py-4">
                <span class="mt-2.5 size-[5px] shrink-0 rounded-full bg-gold" />
                <span class="text-[16px] leading-[1.65] text-ink">{{ ex }}</span>
              </li>
            </ul>
          </div>

          <div class="flex flex-col gap-3 border-l-2 border-gold pl-6">
            <p class="text-[16px] leading-[1.7] text-prose">
              The question is no longer simply how ASEAN becomes more connected. The question is:
            </p>
            <p class="text-[clamp(22px,2.6vw,30px)] font-extrabold leading-[1.2] tracking-[-0.03em] text-navy">
              {{ WHY_NOW.question }}
            </p>
            <p class="text-[16px] leading-[1.7] text-prose">
              That is the conversation APCR wants to build.
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- The new reputation landscape -->
    <section id="risks" class="bg-paper py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <SiteSectionHead eyebrow="THE NEW REPUTATION LANDSCAPE" title="THE RISKS HAVE CHANGED" col-class="lg:w-[640px]">
            <template #intro>
              The age of AI is changing the way trust is created—and destroyed.
            </template>
          </SiteSectionHead>

          <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="(risk, i) in RISKS"
              :key="risk.title"
              class="flex flex-col gap-3.5 rounded-[2px] border border-ink/16 bg-white px-[26px] pb-7 pt-[26px]"
            >
              <span class="text-[12px] font-extrabold tracking-[0.1em] text-gold">{{ String(i + 1).padStart(2, '0') }}</span>
              <h3 class="text-[19px] font-extrabold leading-[1.25] tracking-[-0.026em] text-ink">
                {{ risk.title }}
              </h3>
              <p class="text-[14px] leading-[1.7] text-prose">
                {{ risk.copy }}
              </p>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- From risk to opportunity -->
    <section id="opportunity" class="bg-navy-deep py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <SiteEyebrow dark>
            FROM RISK TO OPPORTUNITY
          </SiteEyebrow>

          <div class="flex flex-col gap-10 lg:flex-row lg:gap-0">
            <template v-for="(col, i) in CONNECTIONS" :key="col.title">
              <!-- The arrow is decoration between columns, so it is hidden where they stack. -->
              <div v-if="i > 0" aria-hidden="true" class="hidden w-[72px] shrink-0 justify-center pt-6 lg:flex">
                <span class="text-[26px] font-extrabold text-gold">→</span>
              </div>
              <div class="flex flex-1 flex-col gap-3.5 border-t-2 border-white/24 pt-6">
                <h3 class="text-[24px] font-extrabold leading-[1.2] tracking-[-0.031em] text-white">
                  {{ col.title }}
                </h3>
                <p class="text-[14px] leading-[1.75] text-white/70">
                  {{ col.items.join(' • ') }}
                </p>
              </div>
            </template>
          </div>

          <div class="flex flex-col gap-3 border-t border-white/16 pt-8">
            <h2 class="text-[clamp(28px,4.2vw,50px)] font-extrabold leading-[1.06] tracking-[-0.042em] text-white">
              TRUST BECOMES ECONOMIC INFRASTRUCTURE
            </h2>
            <p class="text-[13px] font-extrabold tracking-[0.1em] text-gold-soft">
              PUBLIC TRUST × BUSINESS CONFIDENCE × INSTITUTIONAL REPUTATION
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Not another PR conference -->
    <section id="platform" class="border-b border-ink/16 bg-white py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <img
            src="/landing/conference-audience.webp"
            alt="Communication leaders applauding in the audience at a forum session"
            width="480"
            height="520"
            loading="lazy"
            class="h-[320px] w-full rounded-[2px] object-cover lg:h-[560px] lg:w-[480px] lg:shrink-0"
          >

          <div class="flex flex-1 flex-col gap-[22px]">
            <SiteEyebrow>THIS IS WHY APCR EXISTS</SiteEyebrow>
            <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
              NOT ANOTHER PR CONFERENCE.
            </h2>
            <p class="text-[17px] leading-[1.78] text-prose">
              APCR is a regional platform at the intersection of:
            </p>
            <p class="text-[14px] font-extrabold tracking-[0.079em] text-navy">
              BUSINESS × GOVERNMENT × COMMUNICATION × KNOWLEDGE
            </p>
            <p class="text-[17px] leading-[1.78] text-prose">
              We bring together people who normally sit in different rooms:
            </p>

            <ul>
              <li v-for="s in STAKEHOLDERS" :key="s.who" class="border-t border-ink/16 py-[14px] text-[15px] leading-[1.7] text-prose">
                <strong class="font-extrabold text-ink">{{ s.who }},</strong> {{ s.role }}
              </li>
            </ul>

            <p class="text-[17px] font-bold leading-[1.7] text-ink">
              Because the trust challenges facing ASEAN cannot be solved by communication professionals alone. They require an ecosystem.
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- The APCR trust framework -->
    <section id="framework" class="bg-navy-deep py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <div class="flex flex-col gap-[22px]">
            <SiteEyebrow dark>
              THE APCR TRUST FRAMEWORK
            </SiteEyebrow>
            <h2 class="text-[clamp(28px,4.2vw,50px)] font-extrabold leading-[1.06] tracking-[-0.042em] text-white">
              BUILD TRUST.<br>CREATE VALUE.<br>PROTECT TRUST.
            </h2>
          </div>

          <ul class="grid gap-10 lg:grid-cols-3 lg:gap-10">
            <li v-for="pillar in FRAMEWORK" :key="pillar.title" class="flex flex-col gap-4 border-t-2 border-white/24 pt-6">
              <h3 class="text-[20px] font-extrabold leading-[1.2] tracking-[-0.025em] text-gold-soft">
                {{ pillar.title }}
              </h3>
              <ul class="flex flex-col gap-2.5">
                <li v-for="item in pillar.items" :key="item" class="flex gap-2.5">
                  <span class="mt-2.5 size-[5px] shrink-0 rounded-full bg-gold" />
                  <span class="text-[15px] leading-[1.65] text-white/80">{{ item }}</span>
                </li>
              </ul>
            </li>
          </ul>

          <p class="border-t border-white/16 pt-6 text-[13px] font-extrabold tracking-[0.12em] text-white/70">
            BUILD → CREATE VALUE → PROTECT → REBUILD
          </p>
        </div>
      </SiteContainer>
    </section>

    <!-- From Sumatra to ASEAN -->
    <section id="sumatra" class="border-b border-ink/16 bg-white py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <img
            src="/landing/lake-toba.webp"
            alt="Lake Toba and the green highlands of North Sumatra"
            width="480"
            height="520"
            loading="lazy"
            class="h-[320px] w-full rounded-[2px] object-cover lg:h-[520px] lg:w-[480px] lg:shrink-0"
          >

          <div class="flex flex-1 flex-col gap-[22px]">
            <SiteEyebrow>FROM SUMATRA TO ASEAN</SiteEyebrow>
            <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
              WHY MEDAN? WHY SUMATRA?
            </h2>
            <p class="text-[17px] leading-[1.78] text-prose">
              {{ SUMATRA.lead }}
            </p>
            <p class="text-[19px] font-bold leading-[1.6] text-ink">
              {{ SUMATRA.belief }}
            </p>
            <p class="text-[17px] leading-[1.78] text-prose">
              {{ SUMATRA.context }}
            </p>
            <div class="flex flex-col gap-2 border-y border-ink/16 py-5">
              <p class="text-[13px] text-prose">
                {{ SUMATRA.bridgeLead }}
              </p>
              <p class="text-[16px] font-extrabold tracking-[0.079em] text-navy">
                {{ SUMATRA.bridge }}
              </p>
            </div>
            <p class="text-[17px] leading-[1.78] text-prose">
              {{ SUMATRA.purpose }}
            </p>
            <p class="text-[14px] font-extrabold tracking-[0.1em] text-gold">
              {{ SUMATRA.signoff }}
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- About the initiator -->
    <section id="initiator" class="bg-paper py-20 lg:py-[84px]">
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
              {{ INITIATOR.copy }}
            </p>
            <p class="text-[17px] leading-[1.78] text-prose">
              {{ INITIATOR.expanding }}
            </p>
            <p class="text-[14px] font-extrabold leading-[1.8] tracking-[0.079em] text-navy">
              {{ INITIATOR.journey[0] }}<br>{{ INITIATOR.journey[1] }}
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Closing call to action -->
    <section class="bg-navy-deep py-16 lg:pb-[68px] lg:pt-16">
      <SiteContainer>
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div class="flex flex-col gap-3.5 lg:w-[660px]">
            <h2 class="text-[clamp(26px,3.1vw,36px)] font-extrabold leading-[1.12] tracking-[-0.039em] text-white">
              ASEAN IS BECOMING MORE CONNECTED.
            </h2>
            <p class="text-[16px] leading-[1.6] text-white/80">
              The next challenge is making sure it also becomes more trusted. Join the conversation.
            </p>
            <p class="text-[14px] font-bold text-gold-soft">
              {{ HERO.date }} · {{ HERO.location }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <SiteButton :to="registerHref" icon="i-lucide-arrow-right">
              REGISTER FOR APCR 2026
            </SiteButton>
            <SiteButton :to="WHATSAPP_URL" variant="light">
              CONTACT VIA WHATSAPP
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
