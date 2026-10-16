<script setup lang="ts">
import {
  AUDIENCE, CONNECTIONS, ECOSYSTEM, FRAMEWORK, HERO, OUTPUTS,
  RISKS, SCENARIOS, STAKEHOLDERS, WHY_NOW
} from '~/data/home'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'APCR 2026 — ASEAN Public Communication & Reputation Forum',
  titleTemplate: null,
  description: HERO.copy[0],
  themeColor: '#031735'
})

const registerHref = await useRegisterHref()

const { data: partners } = await useFetch('/api/public/partners', { default: () => [] })
const partnerGroups = computed(() => (Object.keys(PARTNER_CATEGORY) as (keyof typeof PARTNER_CATEGORY)[])
  .map(key => ({ label: PARTNER_CATEGORY[key].toUpperCase(), items: partners.value.filter(p => p.category === key) }))
  .filter(g => g.items.length))
</script>

<template>
  <div>
    <!-- Hero -->
    <section id="home" class="relative overflow-hidden bg-navy-deep">
      <img
        src="/landing/networking.webp"
        alt="ASEAN professionals networking at a regional forum"
        width="1100"
        height="825"
        fetchpriority="high"
        class="absolute inset-0 size-full object-cover"
      >
      <div class="absolute inset-0" style="background: linear-gradient(to right, #031735f7 0%, #031735eb 50%, #03173599 100%)" />

      <SiteContainer>
        <div class="relative flex min-h-[480px] flex-col justify-center gap-5 py-16 lg:min-h-[600px] lg:py-20">
          <SiteEyebrow dark>
            {{ HERO.eyebrow }}
          </SiteEyebrow>

          <h1 class="text-[clamp(34px,5vw,60px)] font-extrabold leading-[0.98] tracking-[-0.05em] text-white">
            <template v-for="(line, i) in HERO.title" :key="line">
              {{ line }}<br v-if="i < HERO.title.length - 1">
            </template>
          </h1>

          <div class="flex flex-wrap items-center gap-3.5 text-white">
            <p class="text-[17px] font-extrabold">
              {{ HERO.date }}
            </p>
            <span class="hidden h-4 w-px bg-white/35 sm:block" />
            <p class="text-[16px] text-white/85">
              {{ HERO.location }}
            </p>
          </div>

          <div class="flex max-w-[720px] flex-col gap-3">
            <h2 class="text-[clamp(18px,1.9vw,22px)] font-extrabold leading-[1.2] tracking-[-0.03em] text-gold-soft">
              {{ HERO.positioning }}
            </h2>
            <p v-for="p in HERO.copy" :key="p" class="text-[16px] leading-[1.6] text-white/85">
              {{ p }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3 pt-1">
            <SiteButton :to="registerHref" size="lg" icon="i-lucide-arrow-right">
              REGISTER NOW
            </SiteButton>
            <SiteButton to="#apcr2026" variant="light" size="lg">
              EXPLORE APCR 2026
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Why APCR? Why now? -->
    <section id="about" class="py-20 lg:pb-20 lg:pt-[88px]">
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
          <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-[72px]">
            <div class="flex flex-col gap-5 lg:w-[640px] lg:shrink-0">
              <SiteEyebrow>THE NEW REPUTATION LANDSCAPE</SiteEyebrow>
              <h2 class="text-[clamp(28px,3.9vw,46px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
                THE RISKS HAVE CHANGED
              </h2>
            </div>
            <p class="text-[16px] leading-[1.75] text-prose">
              The age of AI is changing the way trust is created—and destroyed.
            </p>
          </div>

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

    <!-- This is why APCR exists -->
    <section id="platform" class="border-b border-ink/16 bg-white py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <img
            src="/landing/networking.webp"
            alt="Business and public communication professionals networking"
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

    <!-- Three real-world questions -->
    <section id="questions" class="bg-paper py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <div class="flex flex-col gap-5">
            <SiteEyebrow>THREE REAL-WORLD QUESTIONS</SiteEyebrow>
            <h2 class="text-[clamp(28px,4vw,48px)] font-extrabold leading-[1.05] tracking-[-0.044em] text-ink">
              WHAT HAPPENS WHEN TRUST IS CHALLENGED?
            </h2>
          </div>

          <ul class="grid gap-6 lg:grid-cols-3">
            <li v-for="s in SCENARIOS" :key="s.title" class="flex flex-col overflow-hidden rounded-[2px] border border-ink/16 bg-white">
              <img :src="s.image" :alt="s.alt" width="360" height="200" loading="lazy" class="h-[200px] w-full object-cover">
              <div class="flex flex-1 flex-col gap-3 px-6 pb-7 pt-[22px]">
                <h3 class="text-[21px] font-extrabold leading-[1.2] tracking-[-0.029em] text-ink">
                  {{ s.title }}
                </h3>
                <p v-for="p in s.copy" :key="p" class="text-[14px] leading-[1.7] text-prose">
                  {{ p }}
                </p>
              </div>
            </li>
          </ul>

          <div class="flex flex-col gap-1 border-l-2 border-gold pl-6">
            <p class="text-[17px] leading-[1.7] text-prose">
              These are no longer hypothetical communication problems.
            </p>
            <p class="text-[19px] font-extrabold leading-[1.5] text-ink">
              They are leadership, economic and reputation challenges.
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

    <!-- APCR 2026: the three-day journey -->
    <section id="apcr2026" class="py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[34px]">
          <div class="flex flex-col gap-5">
            <SiteEyebrow>THE THREE-DAY APCR JOURNEY</SiteEyebrow>
            <h2 class="max-w-[900px] text-[clamp(28px,4vw,48px)] font-extrabold leading-[1.05] tracking-[-0.044em] text-ink">
              THREE DAYS. THREE QUESTIONS. ONE TRUST ECOSYSTEM.
            </h2>
          </div>

          <SiteProgrammeRundown />
        </div>
      </SiteContainer>
    </section>

    <!-- From Sumatra to ASEAN -->
    <section id="sumatra" class="border-y border-ink/16 bg-white py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <img
            src="/landing/medan.webp"
            alt="Professionals walking through Medan heritage district"
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
              APCR begins in Medan with a simple belief:
            </p>
            <p class="text-[19px] font-bold leading-[1.6] text-ink">
              Strong ASEAN collaboration can grow from strong regions.
            </p>
            <p class="text-[17px] leading-[1.78] text-prose">
              Sumatra sits strategically close to some of ASEAN's major economic centres and possesses significant assets in energy, agriculture, plantations, tourism, finance, logistics, culture and human capital.
            </p>
            <div class="flex flex-col gap-2 border-y border-ink/16 py-5">
              <p class="text-[13px] text-prose">
                APCR wants to create a bridge:
              </p>
              <p class="text-[16px] font-extrabold tracking-[0.079em] text-navy">
                SUMATRA → INDONESIA → ASEAN
              </p>
            </div>
            <p class="text-[17px] leading-[1.78] text-prose">
              Not merely to promote Sumatra, but to connect its leaders, institutions, businesses, ideas and opportunities with the wider ASEAN ecosystem.
            </p>
            <p class="text-[14px] font-extrabold tracking-[0.1em] text-gold">
              FROM SUMATRA TO ASEAN.
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- What APCR should produce -->
    <section id="knowledge" class="py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-[72px]">
            <div class="flex flex-col gap-5 lg:w-[640px] lg:shrink-0">
              <SiteEyebrow>WHAT APCR SHOULD PRODUCE</SiteEyebrow>
              <h2 class="text-[clamp(27px,3.7vw,44px)] font-extrabold leading-[1.06] tracking-[-0.043em] text-ink">
                FROM CONVERSATION TO KNOWLEDGE.<br>FROM CONNECTION TO COLLABORATION.
              </h2>
            </div>
            <p class="text-[16px] leading-[1.75] text-prose">
              APCR is designed to move beyond conference conversations. The ecosystem will progressively develop:
            </p>
          </div>

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

    <!-- APCR 365 -->
    <section id="apcr365" class="bg-navy-deep py-20 lg:pb-[88px] lg:pt-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-[26px]">
          <SiteEyebrow dark>
            APCR 365
          </SiteEyebrow>
          <h2 class="max-w-[980px] text-[clamp(28px,4.2vw,50px)] font-extrabold leading-[1.06] tracking-[-0.042em] text-white">
            THREE DAYS BRING THE COMMUNITY TOGETHER.<br>APCR 365 KEEPS THE CONVERSATION GOING.
          </h2>
          <p class="max-w-[860px] text-[18px] leading-[1.7] text-white/80">
            APCR is not intended to end when the conference closes. The annual forum is the meeting point of a wider ecosystem involving:
          </p>
          <ul class="flex flex-wrap gap-2.5">
            <li v-for="item in ECOSYSTEM" :key="item" class="rounded-[2px] border border-white/24 px-3.5 py-2 text-[12px] font-extrabold tracking-[0.1em] text-gold-soft">
              {{ item }}
            </li>
          </ul>
          <p class="max-w-[860px] border-t border-white/16 pt-6 text-[17px] leading-[1.7] text-white/80">
            Throughout the year, APCR aims to connect leaders, ideas and institutions around one common agenda:
            <strong class="font-extrabold text-white">BUILDING A MORE TRUSTED ASEAN.</strong>
          </p>
        </div>
      </SiteContainer>
    </section>

    <!-- Who should be in the room -->
    <section id="audience" class="bg-paper py-20 lg:py-[84px]">
      <SiteContainer>
        <div class="flex flex-col gap-8">
          <SiteEyebrow>WHO SHOULD BE IN THE ROOM?</SiteEyebrow>

          <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="group in AUDIENCE"
              :key="group.title"
              class="flex flex-col gap-3 rounded-[2px] border border-ink/16 bg-white px-[26px] pb-7 pt-[26px]"
            >
              <h2 class="text-[21px] font-extrabold leading-[1.2] tracking-[-0.029em] text-ink">
                {{ group.title }}
              </h2>
              <p class="text-[14px] leading-[1.75] text-prose">
                {{ group.items.join(' • ') }}
              </p>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

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
          <div v-for="group in partnerGroups" :key="group.label" class="flex flex-col gap-6">
            <SiteEyebrow>
              {{ group.label }}
            </SiteEyebrow>
            <ul class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <li
                v-for="partner in group.items"
                :key="partner.id"
                class="flex h-[104px] items-center justify-center rounded-[2px] border border-ink/16 bg-white px-4 py-3.5"
              >
                <img v-if="partner.logoUrl" :src="partner.logoUrl" :alt="partner.name" loading="lazy" class="max-h-full max-w-full object-contain">
                <span v-else class="text-center text-[11px] font-extrabold uppercase tracking-[0.073em] text-[#7c8695]">{{ partner.name }}</span>
              </li>
            </ul>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Join the conversation -->
    <section id="registration" class="bg-navy-deep py-20 lg:py-[96px]">
      <SiteContainer>
        <div class="flex flex-col items-start gap-[26px]">
          <h2 class="max-w-[980px] text-[clamp(28px,4.2vw,50px)] font-extrabold leading-[1.06] tracking-[-0.042em] text-white">
            ASEAN IS BECOMING MORE CONNECTED.
          </h2>
          <p class="max-w-[860px] text-[19px] leading-[1.65] text-white/85">
            The next challenge is making sure it also becomes more trusted.
          </p>

          <div class="flex w-full flex-col gap-3 border-t border-white/16 pt-8">
            <h3 class="text-[22px] font-extrabold tracking-[-0.025em] text-gold-soft">
              JOIN THE CONVERSATION.
            </h3>
            <p class="text-[13px] font-extrabold tracking-[0.1em] text-white">
              ASEAN PUBLIC COMMUNICATION &amp; REPUTATION FORUM (APCR) 2026
            </p>
            <div class="flex flex-wrap items-center gap-3.5 text-white">
              <p class="text-[17px] font-extrabold">
                {{ HERO.date }}
              </p>
              <span class="hidden h-4 w-px bg-white/35 sm:block" />
              <p class="text-[16px] text-white/85">
                {{ HERO.location }}
              </p>
            </div>
            <p class="text-[15px] text-white/70">
              Building Trust. Shaping Reputation. Connecting ASEAN.
            </p>
          </div>

          <SiteButton :to="registerHref" size="lg" icon="i-lucide-arrow-right">
            REGISTER FOR APCR 2026
          </SiteButton>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
