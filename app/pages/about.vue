<script setup lang="ts">
import { AMBITIONS, BODIES, FORCES, MISSION, PILLARS, ROLES } from '~/data/about'
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'About APCR',
  description: 'The ASEAN Public Communication & Reputation Forum is a regional platform initiated by PR INDONESIA — created so that trust, reputation and public communication are treated as regional work, not national afterthoughts.',
  themeColor: '#031735'
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-navy-deep py-20 lg:pb-[84px] lg:pt-[88px]">
      <SiteContainer>
        <div class="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-[72px]">
          <div class="flex flex-col gap-[26px] lg:w-[700px] lg:shrink-0">
            <SiteEyebrow dark>
              ABOUT APCR
            </SiteEyebrow>
            <h1 class="text-[clamp(34px,5.4vw,64px)] font-extrabold leading-none tracking-[-0.047em] text-white">
              BUILDING TRUST.<br>SHAPING REPUTATION.<br>CONNECTING ASEAN.
            </h1>
            <p class="text-[19px] leading-[1.68] text-white/85">
              The ASEAN Public Communication &amp; Reputation Forum is a regional platform initiated by PR INDONESIA — created so that trust, reputation and public communication are treated as regional work, not national afterthoughts.
            </p>
          </div>

          <div class="flex flex-1 flex-col gap-4 border-l-2 border-white/24 py-1.5 pl-[26px]">
            <p class="text-[11px] font-extrabold tracking-[0.118em] text-gold-soft">
              INITIATED BY
            </p>
            <p class="text-[28px] font-extrabold leading-[1.2] tracking-[-0.032em] text-white">
              PR INDONESIA
            </p>
            <p class="text-[14px] leading-[1.72] text-white/70">
              Indonesia's public relations knowledge institution, convening the forum together with government, business and academic partners across the region.
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Our conviction -->
    <section class="py-20 lg:pb-20 lg:pt-[88px]">
      <SiteContainer>
        <div class="flex flex-col gap-11">
          <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
            <div class="flex flex-col gap-5 lg:w-[540px] lg:shrink-0">
              <SiteEyebrow>OUR CONVICTION</SiteEyebrow>
              <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.1] tracking-[-0.043em] text-ink">
                Trust is becoming one of ASEAN's most valuable assets.
              </h2>
            </div>
            <div class="flex flex-1 flex-col gap-5 lg:pt-2">
              <p class="text-[17px] leading-[1.78] text-prose">
                Capital, talent and attention move to places that can be believed. Across the region, confidence in institutions now shapes investment decisions, policy adoption, market access and the simple willingness of citizens to cooperate.
              </p>
              <p class="text-[17px] leading-[1.78] text-prose">
                Yet trust is rarely owned by a single sector. It is produced where public policy, business conduct and communication practice meet — and that intersection is exactly what APCR was built to convene.
              </p>
            </div>
          </div>

          <div class="flex flex-col items-center gap-4 rounded-[2px] border border-ink/16 bg-white px-9 pb-9 pt-[34px]">
            <p class="text-[11px] font-extrabold tracking-[0.118em] text-prose-dim">
              THE MEETING POINT
            </p>
            <p class="flex flex-wrap items-center justify-center gap-x-[22px] gap-y-1 text-center text-[clamp(20px,3vw,30px)] font-extrabold tracking-[-0.027em] text-ink">
              POLICY <span class="text-gold">×</span> BUSINESS <span class="text-gold">×</span> COMMUNICATION
            </p>
            <p class="max-w-[720px] text-center text-[15px] leading-[1.7] text-prose">
              Three constituencies that each hold part of the answer, in one room, working to the same agenda.
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Vision & mission -->
    <section id="vision" class="bg-paper py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-12 lg:flex-row lg:gap-[72px]">
          <div class="flex flex-col gap-[22px] lg:w-[470px] lg:shrink-0">
            <SiteEyebrow>VISION</SiteEyebrow>
            <h2 class="text-[clamp(26px,3.1vw,36px)] font-extrabold leading-[1.14] tracking-[-0.039em] text-ink">
              To become a leading ASEAN platform for public communication, trust and reputation.
            </h2>
            <p class="text-[15px] leading-[1.75] text-prose">
              Not a title to claim, but a standard to be measured against — by the quality of the people in the room and the work that leaves it.
            </p>
          </div>

          <div class="flex flex-1 flex-col gap-[22px]">
            <SiteEyebrow>MISSION</SiteEyebrow>
            <ol class="border-t border-ink/16">
              <li v-for="(m, i) in MISSION" :key="m.title" class="flex gap-[22px] border-b border-ink/16 py-5">
                <span class="text-[13px] font-extrabold tracking-[0.09em] text-gold">{{ String(i + 1).padStart(2, '0') }}</span>
                <div class="flex flex-col gap-[7px]">
                  <h3 class="text-[19px] font-extrabold leading-[1.3] tracking-[-0.021em] text-ink">
                    {{ m.title }}
                  </h3>
                  <p class="text-[14px] leading-[1.7] text-prose">
                    {{ m.copy }}
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Why APCR -->
    <section id="why" class="border-t border-ink/16 bg-white py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-[72px]">
            <div class="flex flex-col gap-5 lg:w-[680px] lg:shrink-0">
              <SiteEyebrow>WHY APCR</SiteEyebrow>
              <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
                ASEAN IS CHANGING FASTER THAN ITS INSTITUTIONS CAN EXPLAIN.
              </h2>
            </div>
            <p class="text-[16px] leading-[1.75] text-prose">
              Five forces are reshaping how the region is seen, financed and governed. None of them stop at a national border.
            </p>
          </div>

          <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <li v-for="force in FORCES" :key="force.title" class="flex flex-col gap-3 border-t-2 border-ink/16 pt-5">
              <UIcon :name="force.icon" class="size-5 text-navy" />
              <h3 class="text-[16px] font-extrabold leading-[1.25] tracking-[-0.019em] text-ink">
                {{ force.title }}
              </h3>
              <p class="text-[13px] leading-[1.65] text-prose">
                {{ force.copy }}
              </p>
            </li>
          </ul>

          <div class="flex flex-col gap-3.5 pt-[22px]">
            <SiteEyebrow>THE STRATEGIC ROLE OF COMMUNICATION</SiteEyebrow>
            <p class="max-w-[820px] text-[26px] font-extrabold leading-[1.3] tracking-[-0.031em] text-ink">
              Communication is how institutions stay legible under pressure.
            </p>
          </div>

          <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <li v-for="(role, i) in ROLES" :key="role.title" class="flex gap-3.5 rounded-[2px] bg-paper-soft py-5 pl-5 pr-[22px]">
              <span class="text-[12px] font-extrabold tracking-[0.1em] text-gold">{{ String(i + 1).padStart(2, '0') }}</span>
              <div class="flex flex-col gap-[7px]">
                <h3 class="text-[17px] font-extrabold leading-[1.25] tracking-[-0.018em] text-ink">
                  {{ role.title }}
                </h3>
                <p class="text-[14px] leading-[1.68] text-prose">
                  {{ role.copy }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- From Sumatra to ASEAN -->
    <section id="sumatra" class="py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-9">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-[72px]">
            <div class="flex flex-col gap-5 lg:w-[660px] lg:shrink-0">
              <SiteEyebrow>FROM SUMATRA TO ASEAN</SiteEyebrow>
              <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
                WHY THE FORUM BEGINS IN MEDAN.
              </h2>
            </div>
            <p class="text-[16px] leading-[1.75] text-prose">
              North Sumatra is a trading gateway with deep diaspora links, fast-moving investment and a public that holds institutions to account — the region's story in one province.
            </p>
          </div>

          <div class="flex flex-col gap-10 lg:flex-row lg:gap-14">
            <img
              src="/landing/medan-avenue.jpg"
              alt="A tree-lined avenue in Medan, North Sumatra"
              width="500"
              height="430"
              loading="lazy"
              class="h-[280px] w-full rounded-[2px] object-cover lg:h-[430px] lg:w-[500px] lg:shrink-0"
            >

            <div class="flex flex-1 flex-col gap-6">
              <h3 class="text-[22px] font-extrabold leading-[1.35] tracking-[-0.027em] text-ink">
                The ambition runs in two directions at once.
              </h3>
              <div v-for="a in AMBITIONS" :key="a.label" class="flex flex-col gap-3 rounded-[2px] border border-ink/16 bg-white px-[26px] pb-[26px] pt-6">
                <p class="flex items-center gap-2.5">
                  <UIcon :name="a.icon" class="size-[17px] text-gold" />
                  <span class="text-[12px] font-extrabold tracking-[0.108em] text-navy">{{ a.label }}</span>
                </p>
                <h4 class="text-[21px] font-extrabold leading-[1.25] tracking-[-0.029em] text-ink">
                  {{ a.title }}
                </h4>
                <p class="text-[15px] leading-[1.72] text-prose">
                  {{ a.copy }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Three pillars -->
    <section class="bg-navy-deep py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10">
          <div class="flex flex-col gap-5">
            <SiteEyebrow dark>
              THE APCR FRAMEWORK
            </SiteEyebrow>
            <h2 class="text-[clamp(28px,4.2vw,50px)] font-extrabold leading-[1.05] tracking-[-0.042em] text-white">
              THREE PILLARS. ONE PURPOSE.
            </h2>
          </div>

          <ul class="grid gap-7 lg:grid-cols-3">
            <li v-for="pillar in PILLARS" :key="pillar.label" class="flex flex-col gap-3.5 border-t-2 border-white/24 pt-6">
              <span class="text-[13px] font-extrabold tracking-[0.108em] text-gold-soft">{{ pillar.label }}</span>
              <h3 class="text-[24px] font-extrabold leading-[1.22] tracking-[-0.029em] text-white">
                {{ pillar.title }}
              </h3>
              <p class="text-[15px] leading-[1.72] text-white/70">
                {{ pillar.copy }}
              </p>
            </li>
          </ul>

          <div class="flex flex-col items-center gap-4 border-t border-white/16 pb-2 pt-10">
            <p class="text-[11px] font-extrabold tracking-[0.118em] text-gold-soft">
              THE PURPOSE
            </p>
            <p class="max-w-[900px] text-center text-[clamp(24px,3.4vw,40px)] font-extrabold leading-[1.15] tracking-[-0.04em] text-white">
              To build a more connected, trusted, collaborative, and prosperous ASEAN.
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Governance -->
    <section id="governance" class="border-t border-ink/16 bg-white py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-5">
            <SiteEyebrow>GOVERNANCE</SiteEyebrow>
            <h2 class="max-w-[720px] text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
              HOW APCR IS GOVERNED.
            </h2>
          </div>

          <div class="flex gap-3.5 border-l-[3px] border-gold bg-paper px-6 py-5">
            <UIcon name="i-lucide-info" class="mt-0.5 size-[18px] shrink-0 text-[#9a7320]" />
            <div class="flex flex-col gap-1.5">
              <p class="text-[14px] font-extrabold text-ink">
                Content to be provided by the client
              </p>
              <p class="text-[14px] leading-[1.7] text-prose">
                The bodies below are a placeholder structure so the layout can be reviewed. Names, mandates and terms of reference will replace the grey lines once the governance document is confirmed.
              </p>
            </div>
          </div>

          <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="body in BODIES" :key="body.title" class="flex flex-col gap-3.5 rounded-[2px] border border-ink/16 bg-paper-soft px-6 pb-[26px] pt-6">
              <h3 class="text-[19px] font-extrabold leading-[1.25] tracking-[-0.021em] text-ink">
                {{ body.title }}
              </h3>
              <p class="text-[14px] leading-[1.68] text-prose">
                {{ body.copy }}
              </p>
              <div class="flex flex-col gap-3 border-t border-ink/16 pb-1 pt-[18px]" aria-hidden="true">
                <div v-for="n in 4" :key="n" class="flex flex-col gap-[7px]">
                  <div class="h-[9px] w-full rounded-[2px] bg-ink/12" />
                  <div class="h-[7px] w-[110px] rounded-[2px] bg-ink/6" />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Closing call to action -->
    <section class="bg-navy-deep py-16 lg:pb-[68px] lg:pt-16">
      <SiteContainer>
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div class="flex flex-col gap-3.5 lg:w-[660px]">
            <h2 class="text-[clamp(26px,3.1vw,36px)] font-extrabold leading-[1.12] tracking-[-0.039em] text-white">
              THE FORUM IS WHERE THIS BECOMES WORK.
            </h2>
            <p class="text-[16px] leading-[1.6] text-white/80">
              2–4 December 2026 · Medan, North Sumatra, Indonesia
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <NuxtLink
              to="/apcr-2026"
              class="inline-flex items-center gap-2 rounded-[2px] bg-gold-soft px-5 py-3.5 text-[12px] font-bold text-navy-deep transition-colors hover:bg-white"
            >
              Explore APCR 2026
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </NuxtLink>
            <a
              :href="WHATSAPP_URL"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center rounded-[2px] border border-white/30 px-5 py-3.5 text-[12px] font-bold text-white transition-colors hover:bg-white/10"
            >
              Become a partner
            </a>
          </div>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
