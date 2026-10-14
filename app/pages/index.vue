<script setup lang="ts">
import { AUDIENCE, CONNECTIONS, FRAMEWORK, LEADERS, MEDIA_PARTNERS, NAV_LINKS, OUTPUTS, PROGRAMME, RISKS, SCENARIOS, WHATSAPP_URL } from '~/data/landing'

definePageMeta({ layout: 'landing' })

/** The landing page promotes this event; its registration form is the main call to action. */
const FEATURED_SLUG = 'apcr-2026'

useSeoMeta({
  title: 'APCR 2026 — ASEAN Public Communication & Reputation Forum',
  titleTemplate: null,
  description: 'APCR brings together government, business, academia, technology and communication leaders to explore how ASEAN can build, create value from, and protect trust in an increasingly connected world.',
  themeColor: '#06285f'
})

const { data: events } = await useFetch('/api/public/events')
const registerHref = computed(() => {
  const ev = events.value?.find(e => e.slug === FEATURED_SLUG)
  if (!ev) return '#registration'
  return ev.isOpen ? `/events/${ev.slug}/register` : `/events/${ev.slug}`
})

// Mobile navigation
const menuOpen = ref(false)
useHead({ bodyAttrs: { class: () => (menuOpen.value ? 'overflow-hidden' : '') } })
function closeMenu() {
  menuOpen.value = false
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMenu()
}
let desktop: MediaQueryList | undefined
onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  desktop = window.matchMedia('(min-width: 981px)')
  desktop.addEventListener('change', closeMenu)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  desktop?.removeEventListener('change', closeMenu)
})

// Programme tabs (WAI-ARIA tabs with arrow-key navigation)
const activeDay = ref(PROGRAMME[0]!.id)
const tabRefs = ref<HTMLButtonElement[]>([])
function onTabKeydown(e: KeyboardEvent, i: number) {
  const n = PROGRAMME.length
  const next = { ArrowRight: (i + 1) % n, ArrowDown: (i + 1) % n, ArrowLeft: (i + n - 1) % n, ArrowUp: (i + n - 1) % n, Home: 0, End: n - 1 }[e.key]
  if (next === undefined) return
  e.preventDefault()
  activeDay.value = PROGRAMME[next]!.id
  tabRefs.value[next]?.focus()
}
</script>

<template>
  <div class="apcr">
    <header class="site-header">
      <div class="wrap nav">
        <a href="#home" class="brand" aria-label="APCR home"><img src="/landing/apcr-logo.webp" alt="APCR" width="500" height="500"></a>
        <nav id="navLinks" class="nav-links" :class="{ open: menuOpen }" aria-label="Main navigation">
          <a v-for="l in NAV_LINKS" :key="l.href" :href="l.href" @click="closeMenu">{{ l.label }}</a>
          <NuxtLink class="nav-cta" :to="registerHref" @click="closeMenu">Register</NuxtLink>
        </nav>
        <button
          class="menu-btn"
          type="button"
          aria-controls="navLinks"
          :aria-expanded="menuOpen"
          :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'"
          @click="menuOpen = !menuOpen"
        >
          {{ menuOpen ? '×' : '☰' }}
        </button>
      </div>
    </header>

    <main>
      <section id="home" class="hero">
        <div class="hero-media">
          <img src="/landing/networking.webp" alt="ASEAN professionals networking at a regional forum" width="1100" height="825" fetchpriority="high">
        </div>
        <div class="wrap hero-inner">
          <div class="hero-copy">
            <div class="hero-eyebrow">
              ASEAN PUBLIC COMMUNICATION &amp; REPUTATION FORUM 2026
            </div>
            <h1 class="hero-title">
              BUILDING TRUST.<br>SHAPING REPUTATION.<br><span>CONNECTING ASEAN.</span>
            </h1>
            <div class="hero-event">
              <p class="event-date">
                2–4 December 2026
              </p>
              <p class="event-location">
                Medan, North Sumatra, Indonesia
              </p>
            </div>
            <h2 class="hero-positioning">
              TRUST IS THE NEW INFRASTRUCTURE OF ASEAN
            </h2>
            <p class="hero-desc">
              ASEAN is becoming increasingly connected through business, investment, technology, data, tourism and people. But greater connectivity also creates greater reputational risk.
            </p>
            <p class="hero-desc">
              APCR brings together government, business, academia, technology and communication leaders to explore how ASEAN can build, create value from, and protect trust in an increasingly connected world.
            </p>
            <div class="hero-actions">
              <NuxtLink class="btn btn-gold" :to="registerHref">
                REGISTER NOW
              </NuxtLink>
              <a class="btn btn-line" href="#apcr2026">EXPLORE APCR 2026</a>
            </div>
          </div>
        </div>
      </section>

      <section id="about" class="section">
        <div class="wrap intro-grid">
          <div>
            <div class="kicker">
              WHY APCR? WHY NOW?
            </div>
            <h2 class="h2">
              A MORE CONNECTED ASEAN NEEDS A STRONGER TRUST ECOSYSTEM
            </h2>
          </div>
          <div>
            <p class="lead intro-lead">
              ASEAN is entering a new era of connectivity.
            </p>
            <p class="copy">
              Businesses operate across borders. Digital payments connect markets. Tourism connects cities. Data travels between countries. Artificial intelligence is transforming industries. Social media allows information to move across the region almost instantly.
            </p>
            <p class="copy">
              This creates enormous opportunities. But it also creates new vulnerabilities.
            </p>
            <p class="copy">
              A deepfake involving a CEO or government leader can spread within hours.
            </p>
            <p class="copy">
              An online scam can cross national borders.
            </p>
            <p class="copy">
              A cybersecurity incident can quickly become a reputation crisis.
            </p>
            <p class="copy">
              False information about a company, city or tourism destination can influence customers, investors and visitors far beyond its country of origin.
            </p>
            <p class="copy">
              The question is no longer simply how ASEAN becomes more connected.
            </p>
            <p class="question-copy">
              The question is: CAN ASEAN REMAIN TRUSTED AS IT BECOMES MORE CONNECTED?
            </p>
            <p class="copy">
              That is the conversation APCR wants to build.
            </p>
          </div>
        </div>
      </section>

      <section id="risks" class="section paper">
        <div class="wrap">
          <div class="kicker">
            THE NEW REPUTATION LANDSCAPE
          </div>
          <h2 class="h2">
            THE RISKS HAVE CHANGED
          </h2>
          <p class="lead">
            The age of AI is changing the way trust is created—and destroyed.
          </p>
          <div class="editorial-list">
            <article v-for="r in RISKS" :key="r.title" class="editorial-row">
              <h3 class="row-title">
                {{ r.title }}
              </h3>
              <p class="copy">
                {{ r.copy }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="opportunity" class="section on-dark">
        <div class="wrap">
          <div class="kicker">
            FROM RISK TO OPPORTUNITY
          </div>
          <div class="connection-rows">
            <div v-for="c in CONNECTIONS" :key="c.title" class="connection-row">
              <h2 class="connection-title">
                {{ c.title }}
              </h2>
              <p class="connection-copy">
                {{ c.copy }}
              </p>
            </div>
          </div>
          <div class="economic-trust">
            <h2 class="h2">
              TRUST BECOMES ECONOMIC INFRASTRUCTURE
            </h2>
            <p class="trust-axis">
              PUBLIC TRUST × BUSINESS CONFIDENCE × INSTITUTIONAL REPUTATION
            </p>
          </div>
        </div>
      </section>

      <section id="platform" class="section">
        <div class="wrap platform-grid">
          <div class="platform-photo">
            <img src="/landing/networking.webp" alt="Business and public communication professionals networking" width="1100" height="825" loading="lazy" decoding="async">
          </div>
          <div>
            <div class="kicker">
              THIS IS WHY APCR EXISTS
            </div>
            <h2 class="h2">
              NOT ANOTHER PR CONFERENCE.
            </h2>
            <p class="copy">
              APCR is a regional platform at the intersection of:
            </p>
            <p class="axis-copy">
              BUSINESS × GOVERNMENT × COMMUNICATION × KNOWLEDGE
            </p>
            <p class="copy">
              We bring together people who normally sit in different rooms:
            </p>
            <ul class="leader-list">
              <li v-for="l in LEADERS" :key="l">
                {{ l }}
              </li>
            </ul>
            <p class="lead">
              Because the trust challenges facing ASEAN cannot be solved by communication professionals alone. They require an ecosystem.
            </p>
          </div>
        </div>
      </section>

      <section id="questions" class="section paper">
        <div class="wrap">
          <div class="kicker">
            THREE REAL-WORLD QUESTIONS
          </div>
          <h2 class="h2">
            WHAT HAPPENS WHEN TRUST IS CHALLENGED?
          </h2>
          <div class="scenario-list">
            <article v-for="s in SCENARIOS" :key="s.title" class="scenario-row">
              <div class="scenario-image">
                <img :src="s.image" :alt="s.alt" width="1100" height="825" loading="lazy" decoding="async">
              </div>
              <div>
                <h3 class="h3">
                  {{ s.title }}
                </h3>
                <p v-for="p in s.copy" :key="p" class="copy">
                  {{ p }}
                </p>
              </div>
            </article>
          </div>
          <p class="lead">
            These are no longer hypothetical communication problems.
          </p>
          <p class="lead">
            They are leadership, economic and reputation challenges.
          </p>
        </div>
      </section>

      <section id="framework" class="section on-dark">
        <div class="wrap">
          <div class="kicker">
            THE APCR TRUST FRAMEWORK
          </div>
          <h2 class="h2 framework-head">
            BUILD TRUST.<br>CREATE VALUE.<br>PROTECT TRUST.
          </h2>
          <div class="framework-columns">
            <article v-for="f in FRAMEWORK" :key="f.title" class="framework-column">
              <h3 class="framework-title">
                {{ f.title }}
              </h3>
              <ul>
                <li v-for="i in f.items" :key="i">
                  {{ i }}
                </li>
              </ul>
            </article>
          </div>
          <p class="framework-cycle">
            BUILD → CREATE VALUE → PROTECT → REBUILD
          </p>
        </div>
      </section>

      <section id="apcr2026" class="section">
        <div class="wrap">
          <div class="kicker">
            THE THREE-DAY APCR JOURNEY
          </div>
          <h2 class="h2">
            THREE DAYS. THREE QUESTIONS. ONE TRUST ECOSYSTEM.
          </h2>
          <div class="journey-tabs" role="tablist" aria-label="APCR programme days">
            <button
              v-for="(d, i) in PROGRAMME"
              :id="`journey-tab-${i + 1}`"
              :key="d.id"
              ref="tabRefs"
              type="button"
              class="journey-tab"
              role="tab"
              :aria-controls="d.id"
              :aria-selected="activeDay === d.id"
              :tabindex="activeDay === d.id ? 0 : -1"
              @click="activeDay = d.id"
              @keydown="onTabKeydown($event, i)"
            >
              {{ d.date }}
            </button>
          </div>
          <article
            v-for="(d, i) in PROGRAMME"
            v-show="activeDay === d.id"
            :id="d.id"
            :key="d.id"
            class="journey-panel"
            role="tabpanel"
            :aria-labelledby="`journey-tab-${i + 1}`"
          >
            <p class="journey-date">
              {{ d.date }}
            </p>
            <h3 class="journey-question">
              {{ d.question }}
            </h3>
            <h4 class="journey-name">
              {{ d.name }}
            </h4>
            <p class="journey-theme">
              {{ d.theme }}
            </p>
            <p class="copy">
              {{ d.summary }}
            </p>
            <table class="rundown-table">
              <caption class="visually-hidden">
                APCR 2026 Day {{ i + 1 }} programme
              </caption>
              <thead>
                <tr>
                  <th scope="col">
                    Time
                  </th>
                  <th scope="col">
                    Agenda
                  </th>
                  <th scope="col">
                    Format / Speakers
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in d.rows" :key="r.time + r.title" :class="{ 'rundown-group': r.group }">
                  <td :class="{ 'rundown-time': !r.group }">
                    {{ r.time }}
                  </td>
                  <td :colspan="r.group ? 2 : undefined">
                    <h5 class="rundown-title">
                      {{ r.title }}
                    </h5>
                    <p v-for="x in r.details" :key="x" class="rundown-detail">
                      {{ x }}
                    </p>
                    <ul v-if="r.issues" class="rundown-issues">
                      <li v-for="x in r.issues" :key="x">
                        {{ x }}
                      </li>
                    </ul>
                  </td>
                  <td v-if="!r.group" class="rundown-placeholder" data-label="Format / Speakers">
                    TBC
                  </td>
                </tr>
              </tbody>
            </table>
          </article>
          <p class="rundown-note">
            Speakers and institutional participation: TBC.
          </p>
        </div>
      </section>

      <section id="sumatra" class="section sumatra">
        <div class="sumatra-wrap">
          <div class="sumatra-image">
            <img src="/landing/medan.webp" alt="Professionals walking through Medan heritage district" width="1100" height="825" loading="lazy" decoding="async">
          </div>
          <div class="sumatra-copy">
            <div class="kicker">
              FROM SUMATRA TO ASEAN
            </div>
            <h2 class="h2">
              WHY MEDAN? WHY SUMATRA?
            </h2>
            <p class="copy">
              APCR begins in Medan with a simple belief:
            </p>
            <p class="lead">
              Strong ASEAN collaboration can grow from strong regions.
            </p>
            <p class="copy">
              Sumatra sits strategically close to some of ASEAN's major economic centres and possesses significant assets in energy, agriculture, plantations, tourism, finance, logistics, culture and human capital.
            </p>
            <p class="copy">
              APCR wants to create a bridge: SUMATRA → INDONESIA → ASEAN
            </p>
            <p class="copy">
              Not merely to promote Sumatra, but to connect its leaders, institutions, businesses, ideas and opportunities with the wider ASEAN ecosystem.
            </p>
            <p class="sumatra-quote">
              FROM SUMATRA TO ASEAN.
            </p>
          </div>
        </div>
      </section>

      <section id="knowledge" class="section">
        <div class="wrap">
          <div class="kicker">
            WHAT APCR SHOULD PRODUCE
          </div>
          <h2 class="h2 outputs-head">
            FROM CONVERSATION TO KNOWLEDGE.<br>FROM CONNECTION TO COLLABORATION.
          </h2>
          <p class="lead">
            APCR is designed to move beyond conference conversations.
          </p>
          <p class="copy">
            The ecosystem will progressively develop:
          </p>
          <div class="editorial-list">
            <article v-for="o in OUTPUTS" :key="o.title" class="editorial-row">
              <h3 class="row-title">
                {{ o.title }}
              </h3>
              <p class="copy">
                {{ o.copy }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="apcr365" class="section on-dark">
        <div class="wrap">
          <div class="kicker">
            APCR 365
          </div>
          <h2 class="h2 community-head">
            THREE DAYS BRING THE COMMUNITY TOGETHER.<br>APCR 365 KEEPS THE CONVERSATION GOING.
          </h2>
          <p class="lead community-lead">
            APCR is not intended to end when the conference closes.
          </p>
          <p class="lead">
            The annual forum is the meeting point of a wider ecosystem involving:
          </p>
          <p class="trust-axis">
            RESEARCH × KNOWLEDGE × COMMUNITY × EXECUTIVE LEARNING × BUSINESS NETWORK × COLLABORATION
          </p>
          <p class="lead">
            Throughout the year, APCR aims to connect leaders, ideas and institutions around one common agenda: BUILDING A MORE TRUSTED ASEAN.
          </p>
        </div>
      </section>

      <section id="audience" class="section paper">
        <div class="wrap">
          <div class="kicker">
            WHO SHOULD BE IN THE ROOM?
          </div>
          <div class="editorial-list audience-list">
            <article v-for="a in AUDIENCE" :key="a.title" class="editorial-row">
              <h2 class="row-title">
                {{ a.title }}
              </h2>
              <p class="copy">
                {{ a.copy }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="initiator" class="section">
        <div class="wrap initiator-grid">
          <div class="initiator-mark">
            <img src="/landing/pr-indonesia.png" alt="PR INDONESIA" width="150" height="122" loading="lazy" decoding="async">
          </div>
          <div>
            <div class="kicker">
              ABOUT THE INITIATOR
            </div>
            <h2 class="h2">
              INITIATED BY PR INDONESIA
            </h2>
            <p class="lead">
              Established in 2015, PR INDONESIA is a communication and reputation ecosystem connecting corporations, government institutions, state-owned enterprises, universities, professional associations and communication leaders across Indonesia.
            </p>
            <p class="copy">
              Through APCR, PR INDONESIA is expanding that ecosystem:
            </p>
            <p class="initiator-transition">
              FROM NATIONAL COMMUNICATION ECOSYSTEM<br>TO ASEAN COMMUNICATION ECOSYSTEM.
            </p>
          </div>
        </div>
      </section>

      <section id="media-partners" class="section media-partners" aria-labelledby="media-partners-title">
        <div class="wrap">
          <h2 id="media-partners-title" class="kicker">
            MEDIA PARTNER
          </h2>
          <div class="media-partners-track" role="region" aria-label="Media partner logos; scroll horizontally to view all partners" tabindex="0">
            <div v-for="m in MEDIA_PARTNERS" :key="m.name" class="media-partner-logo">
              <img :src="m.logo" :alt="m.name" loading="lazy" decoding="async">
            </div>
          </div>
          <p class="media-partners-hint">
            Swipe to view all media partners <span aria-hidden="true">→</span>
          </p>
        </div>
      </section>

      <section id="registration" class="section on-dark final-cta">
        <div class="wrap">
          <h2 class="h2">
            ASEAN IS BECOMING MORE CONNECTED.
          </h2>
          <p class="lead">
            The next challenge is making sure it also becomes more trusted.
          </p>
          <h3 class="h3">
            JOIN THE CONVERSATION.
          </h3>
          <p class="final-event-name">
            ASEAN PUBLIC COMMUNICATION &amp; REPUTATION FORUM (APCR) 2026
          </p>
          <p class="event-date">
            2–4 December 2026
          </p>
          <p class="event-location">
            Medan, North Sumatra, Indonesia
          </p>
          <p class="final-tagline">
            Building Trust. Shaping Reputation. Connecting ASEAN.
          </p>
          <NuxtLink class="btn btn-gold" :to="registerHref">
            REGISTER FOR APCR 2026
          </NuxtLink>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="wrap">
        <div class="footer-grid">
          <div>
            <div class="footer-logo">
              <img src="/landing/apcr-logo.webp" alt="APCR" width="500" height="500" loading="lazy" decoding="async">
            </div>
            <div class="footer-tag">
              BUILDING TRUST.<br>SHAPING REPUTATION.<br>CONNECTING ASEAN.<br><br>2–4 December 2026<br>Medan, North Sumatra, Indonesia<br><br>Initiated by PR INDONESIA
            </div>
          </div>
          <div class="footer-col">
            <h4>About</h4>
            <a href="#about">About APCR</a>
            <a href="#sumatra">From Sumatra to ASEAN</a>
            <a href="#risks">The New Reputation Landscape</a>
          </div>
          <div class="footer-col">
            <h4>APCR 2026</h4>
            <a href="#apcr2026">Overview</a>
            <a href="#apcr2026">Programme</a>
            <NuxtLink :to="registerHref">Registration</NuxtLink>
          </div>
          <div class="footer-col">
            <h4>Ecosystem</h4>
            <a href="#knowledge">Knowledge</a>
            <a href="#apcr365">APCR 365</a>
            <NuxtLink to="/news">News &amp; Media</NuxtLink>
            <a href="#initiator">About the Initiator</a>
            <a :href="WHATSAPP_URL" target="_blank" rel="noopener noreferrer">Contact via WhatsApp</a>
          </div>
        </div>
        <div class="footer-partners">
          <div>
            <span>Initiated by</span>
            <img src="/landing/pr-indonesia.png" alt="PR INDONESIA" width="150" height="122" loading="lazy" decoding="async">
          </div>
          <div>
            <span>Partner</span>
            <img src="/landing/nolimit.png" alt="NoLimit" width="221" height="116" loading="lazy" decoding="async">
          </div>
        </div>
        <div class="footer-bottom">
          <span>ASEAN Public Communication &amp; Reputation Forum (APCR)</span>
          <span>Initiated by PR INDONESIA</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
html:has(.apcr) {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  html:has(.apcr) {
    scroll-behavior: auto;
  }
}
</style>

<!-- Landing page styling follows the supplied APCR 2026 page, not the CMS design system. -->
<style scoped>
.apcr {
  --navy: #06285f;
  --navy-deep: #031735;
  --ink: #10131a;
  --paper: #f4f1e9;
  --paper-2: #fbfaf7;
  --gold: #d4a13b;
  --gold-soft: #ead7a8;
  --muted: #69717d;
  --line: rgba(16, 19, 26, .16);
  --line-light: rgba(255, 255, 255, .20);
  --max: 1240px;
  --pad: clamp(22px, 4vw, 58px);
  background: var(--paper-2);
  color: var(--ink);
  font-family: "Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.apcr a { color: inherit; text-decoration: none; }
.apcr img { display: block; width: 100%; height: auto; }
.apcr ::selection { background: var(--gold); color: var(--navy-deep); }
.apcr a:focus-visible, .apcr button:focus-visible { outline: 3px solid var(--gold); outline-offset: 4px; }

.wrap { width: min(var(--max), calc(100% - var(--pad) * 2)); margin-inline: auto; }
.section { padding: clamp(74px, 8vw, 120px) 0; scroll-margin-top: 90px; }
.paper { background: var(--paper); }
.on-dark { background: var(--navy-deep); color: #fff; }
.on-dark .copy, .on-dark .lead { color: rgba(255, 255, 255, .78); }
.on-dark .kicker { color: var(--gold-soft); }

.kicker { font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; display: flex; align-items: center; gap: 10px; color: var(--navy); margin: 0 0 22px; line-height: 1.5; }
.kicker::before { content: ""; width: 26px; min-width: 26px; height: 2px; background: var(--gold); }
.h2 { font-size: clamp(36px, 4.8vw, 68px); line-height: 1.04; letter-spacing: -.045em; font-weight: 800; margin: 0; overflow-wrap: break-word; }
.h3 { font-size: clamp(29px, 3.4vw, 46px); line-height: 1.08; letter-spacing: -.035em; font-weight: 800; margin: 0 0 24px; }
.copy { font-size: 18px; line-height: 1.72; color: #555f6e; margin: 0 0 22px; }
.lead { font-size: clamp(20px, 2.2vw, 27px); line-height: 1.5; margin: 28px 0; letter-spacing: -.015em; }
.copy:last-child, .lead:last-child { margin-bottom: 0; }

.btn { min-height: 50px; display: inline-flex; align-items: center; justify-content: center; padding: 14px 22px; border: 1px solid transparent; border-radius: 2px; font-size: 13px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; transition: transform .18s ease; line-height: 1.3; text-align: center; }
.btn:hover { transform: translateY(-2px); }
.btn-gold { background: var(--gold); color: var(--navy-deep); }
.btn-line { border-color: currentColor; background: transparent; }

/* Header */
.site-header { position: sticky; top: 0; z-index: 100; background: rgba(244, 241, 233, .96); border-bottom: 1px solid var(--line); backdrop-filter: blur(12px); }
.nav { height: 74px; display: flex; align-items: center; gap: 30px; }
.brand { width: 155px; flex: 0 0 auto; }
/* Crop the logo PNG's transparent margins. */
.brand, .footer-logo { position: relative; aspect-ratio: 82 / 35; overflow: hidden; }
.apcr .brand img, .apcr .footer-logo img { position: absolute; width: 142.683%; max-width: none; height: auto; left: -21.342%; top: 50%; transform: translateY(-50.855%); }
.nav-links { margin-left: auto; display: flex; align-items: center; gap: 25px; font-size: 12px; font-weight: 700; }
.nav-links a { padding: 8px 0; }
.apcr .nav-cta { background: var(--navy); color: #fff; padding: 13px 16px; border-radius: 2px; }
.menu-btn { display: none; margin-left: auto; background: transparent; border: 0; color: var(--navy); width: 44px; height: 44px; font-size: 26px; cursor: pointer; }

/* Hero */
.hero { position: relative; min-height: calc(100vh - 74px); overflow: hidden; background: var(--navy-deep); }
.hero-media { position: absolute; inset: 0; }
.apcr .hero-media img { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.hero-media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(3, 23, 53, .96) 0%, rgba(3, 23, 53, .88) 50%, rgba(3, 23, 53, .45) 80%, rgba(3, 23, 53, .28) 100%); }
.hero-inner { position: relative; z-index: 2; padding: clamp(70px, 8vw, 114px) 0; }
.hero-copy { max-width: 860px; color: #fff; }
.hero-eyebrow { font-size: 13px; line-height: 1.6; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: var(--gold-soft); margin-bottom: 28px; }
.hero-title { font-size: clamp(47px, 6.4vw, 88px); line-height: .96; letter-spacing: -.055em; font-weight: 800; margin: 0; }
.hero-title span { color: var(--gold); }
.hero-event { margin: 30px 0 40px; }
.event-date { font-size: 20px; font-weight: 800; margin: 0 0 7px; line-height: 1.5; }
.event-location { font-size: 17px; margin: 0; line-height: 1.5; }
.hero-positioning { font-size: clamp(20px, 2.1vw, 28px); line-height: 1.25; font-weight: 800; letter-spacing: -.02em; margin: 0 0 22px; color: var(--gold-soft); max-width: 800px; }
.hero-desc { max-width: 780px; font-size: 19px; line-height: 1.65; color: rgba(255, 255, 255, .87); margin: 0 0 22px; }
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 32px; }

/* About */
.intro-grid { display: grid; grid-template-columns: .95fr 1.05fr; gap: clamp(40px, 7vw, 100px); align-items: start; }
.intro-lead { margin-top: 0; }
.question-copy { font-size: clamp(24px, 2.4vw, 34px); line-height: 1.28; font-weight: 800; color: var(--navy); margin: 30px 0; letter-spacing: -.025em; }

/* Editorial rows */
.editorial-list { margin-top: 44px; border-top: 1px solid var(--line); }
.editorial-row { display: grid; grid-template-columns: 1fr 1.12fr; gap: 45px; padding: 30px 0; border-bottom: 1px solid var(--line); align-items: start; }
.row-title { font-size: clamp(22px, 2.5vw, 32px); line-height: 1.13; letter-spacing: -.025em; font-weight: 800; margin: 0; color: var(--navy); }
.editorial-row .copy { margin: 0; }

/* Opportunity */
.connection-rows { border-top: 1px solid var(--line-light); }
.connection-row { display: grid; grid-template-columns: .9fr 1.1fr; gap: 50px; padding: 35px 0; border-bottom: 1px solid var(--line-light); align-items: center; }
.connection-title { font-size: clamp(27px, 3vw, 42px); line-height: 1.08; letter-spacing: -.035em; font-weight: 700; margin: 0; }
.connection-copy { font-size: 19px; line-height: 1.7; margin: 0; color: rgba(255, 255, 255, .77); }
.economic-trust { padding-top: 60px; max-width: 1100px; }
.economic-trust .h2 { color: var(--gold); }
.trust-axis { font-size: clamp(19px, 2.2vw, 27px); line-height: 1.65; font-weight: 700; letter-spacing: .01em; color: var(--gold-soft); margin: 30px 0 0; }

/* Platform */
.platform-grid { display: grid; grid-template-columns: .85fr 1.15fr; gap: 65px; align-items: start; }
.platform-photo { position: sticky; top: 106px; }
.apcr .platform-photo img { aspect-ratio: 4 / 5; object-fit: cover; }
.platform-grid .h2 { margin-bottom: 28px; }
.axis-copy { font-size: 22px; line-height: 1.6; font-weight: 800; color: var(--navy); margin: 0 0 28px; }
.leader-list { list-style: disc; padding-left: 22px; margin: 0 0 30px; font-size: 18px; line-height: 1.7; color: #555f6e; }
.leader-list li { padding-left: 5px; margin-bottom: 16px; }

/* Scenarios */
.scenario-list { margin: 48px 0; }
.scenario-row { display: grid; grid-template-columns: .82fr 1.18fr; gap: 60px; padding: 40px 0; border-top: 1px solid var(--line); }
.scenario-row:last-child { border-bottom: 1px solid var(--line); }
.apcr .scenario-image img { aspect-ratio: 4 / 3; object-fit: cover; }
.scenario-row .copy { font-size: 19px; }

/* Framework */
.framework-head { max-width: 900px; }
.framework-columns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 55px; border-top: 1px solid var(--line-light); }
.framework-column { padding: 32px 28px 26px 0; border-right: 1px solid var(--line-light); }
.framework-column + .framework-column { padding-left: 28px; }
.framework-column:last-child { border-right: 0; }
.framework-title { font-size: clamp(20px, 2.3vw, 29px); line-height: 1.2; letter-spacing: -.025em; font-weight: 700; color: var(--gold); margin: 0 0 30px; }
.framework-column ul { list-style: none; padding: 0; margin: 0; font-size: 19px; line-height: 1.65; color: rgba(255, 255, 255, .85); }
.framework-column li { margin: 0 0 12px; }
.framework-cycle { font-size: clamp(22px, 2.6vw, 35px); line-height: 1.5; margin: 45px 0 0; font-weight: 800; color: var(--gold-soft); }

/* Programme */
.journey-tabs { display: flex; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); margin-top: 44px; overflow-x: auto; }
.journey-tab { flex: 1; border: 0; border-right: 1px solid var(--line); background: transparent; padding: 22px 20px; color: var(--navy); font-size: 13px; font-weight: 800; line-height: 1.45; white-space: nowrap; cursor: pointer; }
.journey-tab:last-child { border-right: 0; }
.journey-tab[aria-selected="true"] { background: var(--navy); color: #fff; }
.journey-panel { padding: 42px 0 0; }
.journey-date { font-size: 13px; line-height: 1.6; font-weight: 800; letter-spacing: .07em; color: #947020; margin: 0 0 18px; }
.journey-question { font-size: clamp(31px, 4vw, 54px); line-height: 1.08; letter-spacing: -.04em; font-weight: 700; margin: 0 0 24px; color: var(--navy); }
.journey-name { font-size: clamp(21px, 2.8vw, 32px); line-height: 1.25; letter-spacing: -.02em; margin: 0 0 14px; font-weight: 800; }
.journey-theme { font-size: 15px; line-height: 1.5; letter-spacing: .04em; color: #947020; font-weight: 800; margin: 0 0 30px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.rundown-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 34px; text-align: left; }
.rundown-table th { padding: 16px 18px 16px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); font-size: 12px; line-height: 1.5; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--navy); }
.rundown-table th:first-child { width: 148px; }
.rundown-table th:last-child { width: 154px; }
.rundown-table td { padding: 24px 20px 24px 0; border-bottom: 1px solid var(--line); vertical-align: top; font-size: 16px; line-height: 1.65; overflow-wrap: anywhere; }
.rundown-time { font-weight: 800; color: var(--navy); white-space: nowrap; }
.rundown-title { font-size: 19px; line-height: 1.4; color: var(--navy); margin: 0; font-weight: 800; }
.rundown-detail { font-size: 16px; line-height: 1.65; color: #555f6e; margin: 8px 0 0; }
.rundown-issues { list-style: disc; margin: 12px 0 0; padding-left: 20px; font-size: 16px; line-height: 1.65; color: #555f6e; }
.rundown-issues li + li { margin-top: 5px; }
.rundown-placeholder { color: #555f6e; font-weight: 700; }
.rundown-group td { background: var(--paper); font-weight: 800; color: var(--navy); border-top: 2px solid var(--navy); }
.rundown-note { font-size: 14px; line-height: 1.6; color: #555f6e; margin: 26px 0 0; }

/* Sumatra */
.sumatra { background: var(--ink); color: #fff; padding: 0; }
.sumatra-wrap { display: grid; grid-template-columns: 1fr 1fr; min-height: 680px; }
.apcr .sumatra-image img { height: 100%; object-fit: cover; }
.sumatra-copy { padding: clamp(50px, 6vw, 84px); display: flex; flex-direction: column; justify-content: center; }
.sumatra-copy .h2 { margin-bottom: 30px; }
.sumatra-copy .copy, .sumatra-copy .lead { color: rgba(255, 255, 255, .77); }
.sumatra .kicker { color: var(--gold-soft); }
.sumatra-quote { font-size: clamp(30px, 3.4vw, 46px); line-height: 1.1; letter-spacing: -.035em; font-weight: 800; color: var(--gold); padding-top: 30px; margin: 20px 0 0; border-top: 1px solid var(--line-light); }

/* Knowledge, community, audience, initiator */
.outputs-head { max-width: 1180px; }
.community-head { max-width: 1150px; }
.community-lead { margin-top: 42px; }
.audience-list { margin-top: 16px; }
.audience-list .editorial-row { grid-template-columns: .7fr 1.3fr; }
.initiator-grid { display: grid; grid-template-columns: .5fr 1.5fr; gap: 80px; align-items: start; }
.initiator-mark { background: #fff; padding: 32px; }
.apcr .initiator-mark img { max-width: 220px; width: 100%; margin: auto; }
.initiator-grid .h2 { margin-bottom: 32px; }
.initiator-transition { font-size: clamp(24px, 3vw, 38px); line-height: 1.18; letter-spacing: -.035em; font-weight: 800; color: var(--navy); margin: 35px 0 0; }

/* Media partners */
.media-partners { background: #fff; padding: 56px 0 64px; }
.media-partners-track { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: center; gap: 48px; }
.media-partners-track:focus-visible { outline: 3px solid var(--gold); outline-offset: 6px; }
.media-partner-logo { display: flex; align-items: center; justify-content: center; min-width: 0; height: 144px; }
.apcr .media-partner-logo img { width: 100%; height: 112px; object-fit: contain; }
.media-partners-hint { display: none; }

/* Final call to action */
.final-cta .h2 { max-width: 1100px; color: var(--gold); }
.final-cta .lead { max-width: 850px; margin: 30px 0 45px; }
.final-cta .h3 { font-size: clamp(38px, 5vw, 66px); margin-bottom: 26px; }
.final-event-name { font-size: clamp(18px, 2vw, 25px); line-height: 1.45; font-weight: 800; max-width: 850px; margin: 0 0 24px; }
.final-tagline { font-size: clamp(22px, 2.5vw, 32px); line-height: 1.4; color: var(--gold-soft); margin: 30px 0; }
.final-cta .btn { margin-top: 8px; }

/* Footer */
.footer { background: #fff; color: var(--navy); padding: 64px 0 30px; }
.footer-grid { display: grid; grid-template-columns: 1.1fr .8fr .8fr .8fr; gap: 50px; }
.footer-logo { width: 180px; background: transparent; }
.footer-tag { margin-top: 28px; font-size: 13px; line-height: 1.7; color: #555f6e; }
.footer-col h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; margin: 0 0 17px; color: var(--navy); }
.footer-col a { display: block; font-size: 14px; line-height: 1.5; color: #555f6e; margin: 0 0 12px; }
.footer-col a:hover { color: var(--navy); text-decoration: underline; }
.footer-partners { display: flex; flex-wrap: wrap; gap: 40px; margin: 38px 0 0; padding-top: 30px; border-top: 1px solid var(--line); }
.footer-partners > div { min-width: 180px; }
.footer-partners span { display: block; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--navy); margin-bottom: 18px; }
.apcr .footer-partners img { height: 85px; width: 190px; object-fit: contain; background: #fff; padding: 10px; }
.footer-bottom { margin-top: 35px; padding-top: 18px; border-top: 1px solid var(--line); display: flex; justify-content: space-between; gap: 20px; font-size: 12px; line-height: 1.5; color: #555f6e; }

@media (max-width: 980px) {
  .nav-links { display: none; position: fixed; inset: 74px 0 auto 0; background: var(--paper); padding: 24px var(--pad) 30px; border-bottom: 1px solid var(--line); flex-direction: column; align-items: flex-start; gap: 4px; max-height: calc(100dvh - 74px); overflow-y: auto; }
  .nav-links.open { display: flex; }
  .nav-links a { width: 100%; padding: 13px 0; }
  .apcr .nav-cta { margin-top: 8px; text-align: center; }
  .menu-btn { display: block; }
  .intro-grid, .platform-grid, .scenario-row, .initiator-grid { grid-template-columns: 1fr; gap: 38px; }
  .platform-photo { position: static; }
  .apcr .platform-photo img { aspect-ratio: 16 / 9; }
  .apcr .scenario-image img { max-height: 430px; }
  .sumatra-wrap { grid-template-columns: 1fr; }
  .sumatra-image { height: 460px; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .journey-tab { font-size: 12px; padding: 18px 14px; }
  .framework-column { padding-right: 20px; }
  .framework-column + .framework-column { padding-left: 20px; }
}
@media (max-width: 680px) {
  .apcr { --pad: 20px; }
  .nav { height: 66px; }
  .brand { width: 132px; }
  .nav-links { inset: 66px 0 auto 0; max-height: calc(100dvh - 66px); }
  .section { scroll-margin-top: 80px; padding: 68px 0; }
  .sumatra { padding: 0; }
  .hero-inner { padding: 64px 0; }
  .hero-title { font-size: clamp(35px, 8.5vw, 56px); line-height: 1.04; letter-spacing: -.045em; }
  .hero-media::after { background: linear-gradient(0deg, rgba(3, 23, 53, .97), rgba(3, 23, 53, .85)); }
  .hero-eyebrow { font-size: 12px; letter-spacing: .10em; }
  .hero-desc { font-size: 18px; }
  .hero-event { margin: 26px 0 32px; }
  .hero-actions .btn { flex: 1 1 180px; }
  .h2 { font-size: clamp(31px, 8.2vw, 47px); line-height: 1.07; }
  .editorial-row, .audience-list .editorial-row, .connection-row, .framework-columns { grid-template-columns: 1fr; gap: 16px; }
  .editorial-row { padding: 26px 0; }
  .connection-row { padding: 30px 0; }
  .economic-trust { padding-top: 40px; }
  .scenario-row { padding: 32px 0; gap: 26px; }
  .apcr .scenario-image img { aspect-ratio: 4 / 3; }
  .framework-column, .framework-column + .framework-column { padding: 27px 0; border-right: 0; border-bottom: 1px solid var(--line-light); }
  .framework-column:last-child { border-bottom: 0; }
  .framework-title { margin-bottom: 22px; }
  .framework-columns { gap: 0; margin-top: 38px; }
  .framework-cycle { font-size: 23px; }
  .journey-tabs { flex-direction: column; overflow: visible; }
  .journey-tab { border-right: 0; border-bottom: 1px solid var(--line); text-align: left; white-space: normal; font-size: 13px; }
  .journey-tab:last-child { border-bottom: 0; }
  .journey-panel { padding-top: 32px; }
  .journey-question { font-size: 34px; }
  .journey-name { font-size: 24px; }
  .sumatra-image { height: 330px; }
  .sumatra-copy { padding: 54px 20px; }
  .sumatra-copy .h2 { font-size: 38px; }
  .initiator-mark { max-width: 240px; }
  .footer-grid { grid-template-columns: 1fr; gap: 34px; }
  .footer-bottom { flex-direction: column; }
  .kicker { font-size: 11px; letter-spacing: .10em; }
  .copy { font-size: 17px; }
  .row-title { font-size: 25px; }
  .final-cta .btn { width: 100%; }
  .rundown-table, .rundown-table tbody { display: block; width: 100%; }
  .rundown-table thead { display: none; }
  .rundown-table tr { display: grid; grid-template-columns: 1fr auto; gap: 12px; padding: 22px 0; border-bottom: 1px solid var(--line); }
  .rundown-table td { padding: 0; border: 0; min-width: 0; font-size: 15px; }
  .rundown-table td:first-child { grid-column: 1; grid-row: 1; }
  .rundown-table td:nth-child(2) { grid-column: 1 / -1; grid-row: 2; }
  .rundown-table td:nth-child(3) { grid-column: 2; grid-row: 1; text-align: right; }
  .rundown-placeholder::before { content: attr(data-label) " "; font-size: 11px; font-weight: 400; }
  .rundown-title { font-size: 18px; }
  .rundown-detail, .rundown-issues { font-size: 16px; }
  .rundown-table tr.rundown-group { padding: 22px 16px; background: var(--paper); border-top: 2px solid var(--navy); }
  .media-partners { padding: 42px 0 46px; }
  .media-partners-track { display: flex; gap: 28px; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scrollbar-width: thin; scrollbar-color: var(--navy) #eceef1; padding: 10px 0 20px; -webkit-overflow-scrolling: touch; }
  .media-partner-logo { flex: 0 0 78%; height: 128px; scroll-snap-align: start; }
  .apcr .media-partner-logo img { height: 106px; }
  .media-partners-hint { display: block; margin: 12px 0 0; font-size: 13px; line-height: 1.5; color: #555f6e; }
}
@media (prefers-reduced-motion: reduce) {
  .apcr * { transition: none !important; }
}
</style>
