<script setup lang="ts">
import { CASES, INSIGHTS, OUTLOOK_CONTENTS, PERSPECTIVES, PUBLICATIONS, RESEARCH, TOPICS } from '~/data/knowledge'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Knowledge',
  description: 'Ideas, research and intelligence for building trust and reputation across ASEAN. The knowledge engine behind the forum publishes all year.',
  themeColor: '#031735'
})

const letter = (i: number) => String.fromCharCode(97 + i)
</script>

<template>
  <div>
    <SiteHero
      eyebrow="APCR KNOWLEDGE"
      title="IDEAS, RESEARCH AND&#10;INTELLIGENCE."
      blurb="For building trust and reputation across ASEAN. The knowledge engine behind the forum publishes all year — not once in December."
    />

    <!-- Insight -->
    <section id="insights" class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="INSIGHT" title="ARTICLES FROM THE PRACTICE.">
            <template #intro>
              Short, argued pieces by practitioners and researchers across eight recurring subjects.
            </template>
          </SiteSectionHead>

          <ul class="flex flex-wrap gap-2.5 border-b border-ink/16 pb-6">
            <li v-for="topic in TOPICS" :key="topic" class="rounded-[2px] bg-paper px-3.5 py-2.5 text-[12px] font-bold text-navy">
              {{ topic }}
            </li>
          </ul>

          <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <li v-for="a in INSIGHTS" :key="a.title" class="flex flex-col justify-between gap-3 rounded-[2px] border border-ink/16 bg-white p-6">
              <div class="flex flex-col gap-3">
                <span class="text-[10px] font-extrabold tracking-[0.11em] text-gold">{{ a.topic }}</span>
                <h3 class="text-[21px] font-extrabold leading-[1.2] tracking-[-0.029em] text-ink">
                  {{ a.title }}
                </h3>
                <p class="text-[14px] leading-[1.65] text-prose">
                  {{ a.copy }}
                </p>
              </div>
              <div class="flex items-center justify-between gap-3 border-t border-ink/16 pt-3.5 text-[12px] text-prose-dim">
                <span>{{ a.date }}</span>
                <span>{{ a.read }}</span>
              </div>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Research -->
    <section id="research" class="bg-paper py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <SiteSectionHead eyebrow="RESEARCH" title="TURNING DATA INTO ASEAN INSIGHTS." col-class="lg:w-[680px]">
            <template #intro>
              Research will sit in five programmes, each established with academic and industry partners through 2026–2027.
            </template>
          </SiteSectionHead>

          <ul class="border-t border-ink/16">
            <li v-for="(r, i) in RESEARCH" :key="r.title" class="flex flex-col gap-4 border-b border-ink/16 py-[22px] sm:flex-row sm:gap-[22px]">
              <span class="flex size-[30px] shrink-0 items-center justify-center rounded-[2px] bg-navy-deep text-[13px] font-extrabold text-gold-soft">{{ letter(i) }}</span>
              <div class="flex flex-1 flex-col gap-[7px]">
                <h3 class="text-[20px] font-extrabold leading-[1.25] tracking-[-0.025em] text-ink">
                  {{ r.title }}
                </h3>
                <p class="text-[15px] leading-[1.7] text-prose">
                  {{ r.copy }}
                </p>
              </div>
              <div class="shrink-0 sm:w-[150px] sm:text-right">
                <span class="inline-flex rounded-[2px] border border-ink/24 px-2.5 py-1.5 text-[11px] font-bold tracking-[0.036em] text-prose">{{ r.status }}</span>
              </div>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- APCR Outlook -->
    <section id="outlook" class="border-t border-ink/16 bg-white py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <img src="/landing/outlook-cover.jpg" alt="The ASEAN Trust &amp; Reputation Outlook report" width="400" height="520" loading="lazy" class="h-[340px] w-full rounded-[2px] border border-ink/16 object-cover lg:h-[520px] lg:w-[400px] lg:shrink-0">

          <div class="flex flex-1 flex-col gap-[22px]">
            <SiteEyebrow>APCR OUTLOOK</SiteEyebrow>
            <h2 class="text-[clamp(26px,3.4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.04em] text-ink">
              APCR ASEAN TRUST &amp; REPUTATION OUTLOOK
            </h2>
            <p class="text-[17px] leading-[1.78] text-prose">
              An annual publication on the trends and challenges shaping trust, reputation and public communication across ASEAN — written for people who have to act on them, not only read about them.
            </p>

            <div class="flex flex-col gap-3 border-t border-ink/16 pt-5">
              <p class="text-[11px] font-extrabold tracking-[0.118em] text-navy">
                INSIDE THE 2026 EDITION
              </p>
              <ul class="flex flex-col gap-3">
                <li v-for="item in OUTLOOK_CONTENTS" :key="item" class="flex gap-3">
                  <UIcon name="i-lucide-check" class="mt-1 size-[15px] shrink-0 text-gold" />
                  <span class="text-[14px] leading-[1.65] text-prose">{{ item }}</span>
                </li>
              </ul>
            </div>

            <div class="flex flex-wrap items-center gap-3 pt-2">
              <SiteButton variant="navy" icon="i-lucide-arrow-down">
                Download the Outlook
              </SiteButton>
              <SiteButton variant="dark">
                Previous editions
              </SiteButton>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Case studies -->
    <section id="cases" class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="CASE STUDIES" title="WHAT ACTUALLY HAPPENED, AND WHY.">
            <template #action>
              <!-- The case library is still to come. -->
              <p class="flex items-center gap-2 text-[13px] font-bold text-ink/35">
                Browse the case library
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </p>
            </template>
          </SiteSectionHead>

          <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <li v-for="c in CASES" :key="c.title" class="flex flex-col overflow-hidden rounded-[2px] border border-ink/16 bg-white">
              <img :src="c.image" :alt="c.title" width="347" height="196" loading="lazy" class="h-[196px] w-full object-cover">
              <div class="flex flex-1 flex-col gap-[11px] px-6 pb-6 pt-[22px]">
                <span class="text-[10px] font-extrabold tracking-[0.11em] text-gold">{{ c.sector }}</span>
                <h3 class="text-[20px] font-extrabold leading-[1.22] tracking-[-0.025em] text-ink">
                  {{ c.title }}
                </h3>
                <p class="text-[14px] leading-[1.65] text-prose">
                  {{ c.copy }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Executive perspectives -->
    <section id="perspectives" class="bg-navy-deep py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <SiteSectionHead eyebrow="EXECUTIVE PERSPECTIVES" title="IN THEIR OWN WORDS." dark>
            <template #intro>
              Signed pieces from leaders who carry the decisions, published unedited apart from length.
            </template>
          </SiteSectionHead>

          <ul class="grid gap-7 lg:grid-cols-3">
            <li v-for="p in PERSPECTIVES" :key="p.name" class="flex flex-col gap-5 border-t-2 border-white/24 pt-6">
              <blockquote class="text-[19px] font-extrabold leading-[1.42] tracking-[-0.021em] text-white">
                {{ p.quote }}
              </blockquote>
              <div class="flex items-center gap-3.5 pt-1">
                <img :src="p.photo" :alt="p.name" width="46" height="46" loading="lazy" class="size-[46px] shrink-0 rounded-full object-cover">
                <div class="flex flex-col gap-1">
                  <span class="text-[14px] font-extrabold text-gold-soft">{{ p.name }}</span>
                  <span class="text-[12px] text-white/60">{{ p.role }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Publications -->
    <section id="publications" class="border-t border-ink/16 bg-white py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="PUBLICATIONS" title="THE WORKING LIBRARY.">
            <template #intro>
              Everything APCR publishes stays free to download. Citation is welcome with attribution.
            </template>
          </SiteSectionHead>

          <table class="w-full border-t border-ink/16 text-left">
            <thead>
              <tr class="bg-paper-soft text-[11px] font-extrabold tracking-[0.109em] text-ink">
                <th scope="col" class="py-3.5 pr-6">
                  PUBLICATION
                </th>
                <th scope="col" class="hidden w-[190px] py-3.5 pr-6 lg:table-cell">
                  TYPE
                </th>
                <th scope="col" class="hidden w-[150px] py-3.5 pr-6 md:table-cell">
                  PUBLISHED
                </th>
                <th scope="col" class="hidden w-[150px] py-3.5 pr-6 md:table-cell">
                  FILE
                </th>
                <th scope="col" class="w-10 py-3.5"><span class="sr-only">Download</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in PUBLICATIONS" :key="p.title" class="border-t border-ink/16 align-middle">
                <th scope="row" class="py-5 pr-6 text-[18px] font-extrabold leading-[1.35] tracking-[-0.022em] text-ink">
                  {{ p.title }}
                  <span class="mt-1 block text-[13px] font-normal text-prose lg:hidden">{{ p.type }} · {{ p.published }} · {{ p.file }}</span>
                </th>
                <td class="hidden py-5 pr-6 text-[14px] text-prose lg:table-cell">
                  {{ p.type }}
                </td>
                <td class="hidden py-5 pr-6 text-[14px] text-prose md:table-cell">
                  {{ p.published }}
                </td>
                <td class="hidden py-5 pr-6 text-[14px] text-prose md:table-cell">
                  {{ p.file }}
                </td>
                <td class="py-5 text-right">
                  <UIcon name="i-lucide-arrow-down" class="size-[17px] text-navy" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SiteContainer>
    </section>

    <!-- Briefing sign-up -->
    <section class="bg-paper py-16 lg:pb-[68px] lg:pt-16">
      <SiteContainer>
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
          <div class="flex flex-col gap-3 lg:w-[600px]">
            <h2 class="text-[clamp(24px,2.9vw,34px)] font-extrabold leading-[1.12] tracking-[-0.038em] text-ink">
              GET THE KNOWLEDGE BRIEFING.
            </h2>
            <p class="text-[16px] leading-[1.68] text-prose">
              One email a month: new research, the latest insight pieces and what the Outlook is tracking.
            </p>
          </div>
          <!-- No subscription endpoint yet, so the field is presentational. -->
          <form class="flex flex-wrap items-center gap-2.5" @submit.prevent>
            <label class="sr-only" for="briefing-email">Email address</label>
            <input
              id="briefing-email"
              type="email"
              placeholder="name@organisation.org"
              class="h-12 w-full rounded-[2px] border border-ink/16 bg-white px-3.5 text-[14px] text-ink placeholder:text-prose-dim sm:w-[280px]"
            >
            <SiteButton variant="navy" icon="i-lucide-arrow-right" class="h-12">
              Subscribe
            </SiteButton>
          </form>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
