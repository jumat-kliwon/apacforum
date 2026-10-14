<script setup lang="ts">
import { ACADEMY_TRACKS, COMMUNITY_PLACEHOLDERS, FELLOWS_FACTS, LAB_SUBJECTS, TRUST_ROOM_FORMAT, TRUST_ROOM_WHO } from '~/data/community'
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Community',
  description: 'APCR brings people together for three days. Our community keeps them connected throughout the year.',
  themeColor: '#031735'
})
</script>

<template>
  <div>
    <SiteHero
      eyebrow="COMMUNITY"
      title="ONE FORUM.&#10;A YEAR-ROUND COMMUNITY."
      blurb="APCR brings people together for three days. Our community keeps them connected throughout the year."
      title-class="text-[clamp(34px,5.2vw,62px)] leading-none tracking-[-0.047em]"
    >
      <template #under>
        <p class="text-[15px] font-extrabold tracking-[-0.013em] text-gold-soft">
          Connecting ASEAN beyond the forum.
        </p>
      </template>
    </SiteHero>

    <!-- ASEAN Trust Room -->
    <section id="trust-room" class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <SiteSectionHead eyebrow="ASEAN TRUST ROOM" title="ONE ISSUE. ONE ROOM.&#10;ONE CONVERSATION." size="xl" col-class="lg:w-[700px]">
            <template #intro>
              An invitation-only dialogue. One issue per session, no audience, nothing on the record.
            </template>
          </SiteSectionHead>

          <ul class="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="w in TRUST_ROOM_WHO" :key="w.title" class="flex flex-col gap-3 border-t-2 border-ink/16 pt-[22px]">
              <UIcon :name="w.icon" class="size-5 text-navy" />
              <h3 class="text-[19px] font-extrabold leading-[1.22] tracking-[-0.021em] text-ink">
                {{ w.title }}
              </h3>
              <p class="text-[14px] leading-[1.68] text-prose">
                {{ w.copy }}
              </p>
            </li>
          </ul>

          <dl class="grid gap-6 rounded-[2px] bg-navy-deep px-8 py-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            <div
              v-for="(f, i) in TRUST_ROOM_FORMAT"
              :key="f.label"
              class="flex flex-col gap-1.5"
              :class="i > 0 && 'lg:border-l lg:border-white/16 lg:pl-7'"
            >
              <dt class="text-[11px] font-extrabold tracking-[0.109em] text-white/60">
                {{ f.label }}
              </dt>
              <dd class="text-[17px] font-extrabold leading-[1.3] tracking-[-0.024em] text-white">
                {{ f.value }}
              </dd>
            </div>
          </dl>
        </div>
      </SiteContainer>
    </section>

    <!-- Executive Communication Lab -->
    <section id="lab" class="bg-paper py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <SiteSectionHead eyebrow="EXECUTIVE COMMUNICATION LAB" title="LEARNING THAT HAPPENS ON REAL PROBLEMS." col-class="lg:w-[680px]">
            <template #intro>
              Executive learning across six subjects, worked through live cases rather than lectures.
            </template>
          </SiteSectionHead>

          <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <li v-for="s in LAB_SUBJECTS" :key="s.title" class="flex flex-col gap-3 rounded-[2px] border border-ink/16 bg-white px-6 pb-[26px] pt-6">
              <UIcon :name="s.icon" class="size-5 text-navy" />
              <h3 class="text-[21px] font-extrabold leading-[1.2] tracking-[-0.029em] text-ink">
                {{ s.title }}
              </h3>
              <p class="text-[14px] leading-[1.68] text-prose">
                {{ s.copy }}
              </p>
            </li>
          </ul>

          <div class="flex flex-wrap items-center justify-between gap-8 border-t border-ink/16 pt-6">
            <p class="text-[14px] text-prose">
              One-day intensives · 20 seats per lab · Held in Jakarta, Singapore, Kuala Lumpur and Medan
            </p>
            <!-- The lab calendar is still to come. -->
            <p class="flex items-center gap-2 text-[13px] font-bold text-ink/35">
              See the lab calendar
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- APCR Academy -->
    <section id="academy" class="border-t border-ink/16 bg-white py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <img src="/landing/community-academy.jpg" alt="Executive education session in progress" width="460" height="460" loading="lazy" class="h-[300px] w-full rounded-[2px] object-cover lg:size-[460px] lg:shrink-0">

          <div class="flex flex-1 flex-col gap-[22px]">
            <SiteEyebrow>APCR ACADEMY</SiteEyebrow>
            <h2 class="text-[clamp(27px,3.5vw,42px)] font-extrabold leading-[1.08] tracking-[-0.043em] text-ink">
              EXECUTIVE EDUCATION, BUILT WITH PARTNERS.
            </h2>
            <p class="text-[17px] leading-[1.78] text-prose">
              Executive education and capability development programmes, designed and delivered together with academic and knowledge partners across the region.
            </p>

            <ul class="border-t border-ink/16">
              <li v-for="t in ACADEMY_TRACKS" :key="t.title" class="flex flex-col gap-[7px] border-b border-ink/16 py-[18px]">
                <h3 class="text-[19px] font-extrabold leading-[1.3] tracking-[-0.021em] text-ink">
                  {{ t.title }}
                </h3>
                <p class="text-[15px] leading-[1.7] text-prose">
                  {{ t.copy }}
                </p>
              </li>
            </ul>

            <p class="text-[13px] leading-[1.6] text-prose-dim">
              Partner institutions and the 2027 curriculum are being confirmed through the year.
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Young Communication Fellows -->
    <section id="fellows" class="bg-navy-deep py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <div class="flex flex-1 flex-col gap-6">
            <SiteEyebrow dark>
              YOUNG COMMUNICATION FELLOWS
            </SiteEyebrow>
            <h2 class="text-[clamp(27px,3.5vw,42px)] font-extrabold leading-[1.08] tracking-[-0.043em] text-white">
              BUILDING ASEAN'S NEXT GENERATION OF COMMUNICATION LEADERS.
            </h2>
            <p class="text-[17px] leading-[1.76] text-white/85">
              A yearly cohort of practitioners under thirty, drawn from across the region and mentored through one shared research project from first draft to publication.
            </p>

            <dl class="grid grid-cols-2 gap-6 border-t border-white/16 pt-6 lg:grid-cols-4 lg:gap-0">
              <div
                v-for="(f, i) in FELLOWS_FACTS"
                :key="f.label"
                class="flex flex-col gap-1"
                :class="i > 0 && 'lg:border-l lg:border-white/16 lg:pl-[22px]'"
              >
                <dt class="order-2 text-[12px] text-white/60">
                  {{ f.label }}
                </dt>
                <dd class="order-1 text-[32px] font-extrabold leading-[1.15] tracking-[-0.038em] text-gold-soft">
                  {{ f.value }}
                </dd>
              </div>
            </dl>

            <div class="flex flex-wrap items-center gap-3 pt-1.5">
              <SiteButton :to="WHATSAPP_URL" icon="i-lucide-arrow-right">
                Apply for the 2027 cohort
              </SiteButton>
              <SiteButton :to="WHATSAPP_URL" variant="light">
                Nominate someone
              </SiteButton>
            </div>
          </div>

          <img src="/landing/community-fellows.jpg" alt="Young communication practitioners at work" width="420" height="470" loading="lazy" class="h-[300px] w-full rounded-[2px] object-cover lg:h-[470px] lg:w-[420px] lg:shrink-0">
        </div>
      </SiteContainer>
    </section>

    <!-- APCR Community -->
    <section class="py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="APCR COMMUNITY" title="THE WIDER NETWORK." />

          <SiteNotice title="Not yet defined in the source document">
            The layout below is a placeholder so the section can be reviewed in place. Membership tiers, benefits and joining rules will replace the grey lines once the client confirms them.
          </SiteNotice>

          <ul class="grid gap-6 md:grid-cols-3">
            <li v-for="title in COMMUNITY_PLACEHOLDERS" :key="title" class="flex flex-col gap-3.5 rounded-[2px] border border-ink/16 bg-white px-6 pb-[26px] pt-6">
              <h3 class="text-[19px] font-extrabold leading-[1.25] tracking-[-0.021em] text-ink">
                {{ title }}
              </h3>
              <SiteSkeletonLines :lines="4" />
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Closing call to action -->
    <section class="bg-paper py-16 lg:pb-[68px] lg:pt-16">
      <SiteContainer>
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div class="flex flex-col gap-3 lg:w-[660px]">
            <h2 class="text-[clamp(24px,2.9vw,34px)] font-extrabold leading-[1.12] tracking-[-0.038em] text-ink">
              STAY IN THE ROOM AFTER DECEMBER.
            </h2>
            <p class="text-[16px] leading-[1.68] text-prose">
              Delegates are invited into the community programmes that run through the rest of the year.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <SiteButton :to="WHATSAPP_URL" variant="navy" icon="i-lucide-arrow-right">
              Request an invitation
            </SiteButton>
            <SiteButton to="/contact" variant="dark">
              Contact the secretariat
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
