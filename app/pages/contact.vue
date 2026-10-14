<script setup lang="ts">
import { COUNTRIES, DESKS, QUICK_ANSWERS, SECRETARIAT, SOCIALS } from '~/data/contact'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Contact',
  description: 'Six desks at the APCR Secretariat, each owned by someone who can answer. Write to a desk directly or use the contact form.',
  themeColor: '#031735'
})

const pad = (i: number) => String(i + 1).padStart(2, '0')

/**
 * There is no submission endpoint for this form yet, so it does not pretend to
 * send: it hands the message to the general enquiries desk over mail instead.
 */
const form = reactive({ name: '', institution: '', position: '', country: '', email: '', whatsapp: '', desk: '', message: '' })

const mailtoHref = computed(() => {
  const body = [
    `Name: ${form.name}`,
    `Institution: ${form.institution}`,
    `Position: ${form.position}`,
    `Country: ${form.country}`,
    `Email: ${form.email}`,
    `WhatsApp: ${form.whatsapp}`,
    '',
    form.message
  ].join('\n')
  const to = DESKS.find(d => d.title === form.desk)?.email ?? 'hello@apcrforum.org'
  return `mailto:${to}?subject=${encodeURIComponent(form.desk || 'APCR enquiry')}&body=${encodeURIComponent(body)}`
})

const fieldClass = 'h-[46px] w-full rounded-[2px] border border-ink/16 bg-paper-soft px-3.5 text-[14px] text-ink placeholder:text-prose-dim'
const labelClass = 'text-[12px] font-bold text-ink'
</script>

<template>
  <div>
    <SiteHero
      eyebrow="CONTACT"
      title="LET'S CONNECT."
      blurb="Reaching APCR should never mean writing to a single inbox and waiting. Six desks, each owned by someone who can actually answer."
      title-class="text-[clamp(38px,6vw,72px)] leading-none tracking-[-0.047em]"
    />

    <!-- Desks -->
    <section class="py-20 lg:pb-[76px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="WHO TO CONTACT" title="SIX DESKS, ONE SECRETARIAT.">
            <template #intro>
              Write to the desk directly, or use the form below and it will be routed for you.
            </template>
          </SiteSectionHead>

          <ul class="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            <li v-for="(d, i) in DESKS" :key="d.title" class="flex flex-col gap-3 border-t border-ink/16 pt-[22px]">
              <div class="flex items-center justify-between">
                <UIcon :name="d.icon" class="size-[21px] text-navy" />
                <span class="text-[11px] font-extrabold tracking-[0.1em] text-gold">{{ pad(i) }}</span>
              </div>
              <h3 class="text-[20px] font-extrabold leading-[1.22] tracking-[-0.025em] text-ink">
                {{ d.title }}
              </h3>
              <p class="text-[15px] leading-[1.7] text-prose">
                {{ d.copy }}
              </p>
              <a :href="`mailto:${d.email}`" class="flex items-center gap-2 pt-0.5 text-[13px] font-bold text-navy hover:underline">
                {{ d.email }}
                <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
              </a>
              <p class="text-[12px] text-prose-dim">
                {{ d.sla }}
              </p>
            </li>
          </ul>
        </div>
      </SiteContainer>
    </section>

    <!-- Contact form -->
    <section class="bg-paper py-20 lg:pb-[86px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <form class="flex flex-1 flex-col gap-[22px] rounded-[2px] border border-ink/16 bg-white px-6 pb-[42px] pt-10 sm:px-10">
            <SiteEyebrow>SEND A MESSAGE</SiteEyebrow>
            <h2 class="text-[clamp(24px,2.7vw,32px)] font-extrabold leading-[1.12] tracking-[-0.038em] text-ink">
              TELL US WHAT YOU NEED.
            </h2>

            <div class="grid gap-[18px] sm:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-name">Name</label>
                <input id="c-name" v-model="form.name" :class="fieldClass" placeholder="Dr. Maya Santoso">
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-inst">Institution</label>
                <input id="c-inst" v-model="form.institution" :class="fieldClass" placeholder="Ministry, company or university">
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-pos">Position</label>
                <input id="c-pos" v-model="form.position" :class="fieldClass" placeholder="Director of Communication">
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-country">Country</label>
                <select id="c-country" v-model="form.country" :class="[fieldClass, !form.country && 'text-prose-dim']">
                  <option value="" disabled>
                    Select a country
                  </option>
                  <option v-for="c in COUNTRIES" :key="c" :value="c">
                    {{ c }}
                  </option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-email">Email</label>
                <input id="c-email" v-model="form.email" type="email" :class="fieldClass" placeholder="name@organisation.org">
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-wa">WhatsApp</label>
                <input id="c-wa" v-model="form.whatsapp" type="tel" :class="fieldClass" placeholder="+62 812 0000 0000">
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label :class="labelClass" for="c-desk">Area of Interest</label>
              <select id="c-desk" v-model="form.desk" :class="[fieldClass, !form.desk && 'text-prose-dim']">
                <option value="" disabled>
                  Select the desk closest to your question
                </option>
                <option v-for="d in DESKS" :key="d.title" :value="d.title">
                  {{ d.title }}
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label :class="labelClass" for="c-message">Message</label>
              <textarea
                id="c-message"
                v-model="form.message"
                rows="5"
                class="w-full rounded-[2px] border border-ink/16 bg-paper-soft px-3.5 py-3 text-[14px] text-ink placeholder:text-prose-dim"
                placeholder="Tell us briefly what you need and any deadline you are working to."
              />
            </div>

            <label class="flex items-start gap-3 pt-0.5">
              <input type="checkbox" class="mt-0.5 size-4 rounded-[2px] border border-ink/40">
              <span class="text-[13px] leading-[1.6] text-prose">Keep me on the APCR briefing list. We send one email a month and never share delegate data.</span>
            </label>

            <div class="flex flex-wrap items-center justify-between gap-5 pt-1.5">
              <SiteButton :to="mailtoHref" variant="navy" icon="i-lucide-arrow-right">
                Send message
              </SiteButton>
              <p class="text-[12px] text-prose-dim">
                Routed to the right desk · reply in 1–3 working days
              </p>
            </div>
          </form>

          <aside class="flex flex-col gap-5 lg:w-[350px] lg:shrink-0">
            <img src="/landing/contact-map.jpg" alt="Map of central Medan" width="350" height="200" loading="lazy" class="h-[200px] w-full rounded-[2px] border border-ink/16 object-cover">

            <div class="flex flex-col gap-4 rounded-[2px] border border-ink/16 bg-white px-6 pb-[26px] pt-6">
              <p class="text-[11px] font-extrabold tracking-[0.118em] text-navy">
                SECRETARIAT
              </p>
              <div
                v-for="(row, i) in SECRETARIAT"
                :key="row.icon"
                class="flex gap-3"
                :class="i > 0 && 'border-t border-ink/16 pt-4'"
              >
                <UIcon :name="row.icon" class="mt-1 size-4 shrink-0 text-prose-dim" />
                <p class="text-[14px] leading-[1.65] text-ink" :class="row.strong && 'font-bold'">
                  <template v-for="(line, j) in row.lines" :key="j">
                    {{ line }}<br v-if="j < row.lines.length - 1">
                  </template>
                </p>
              </div>
              <div class="flex gap-2 border-t border-ink/16 pt-[18px]">
                <!-- Social accounts are not published yet. -->
                <span
                  v-for="s in SOCIALS"
                  :key="s.label"
                  class="flex size-9 items-center justify-center rounded-[2px] border border-ink/16 text-ink/35"
                  :title="s.label"
                >
                  <UIcon :name="s.icon" class="size-[15px]" />
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-3 rounded-[2px] bg-navy-deep px-6 pb-[26px] pt-6">
              <p class="text-[11px] font-extrabold tracking-[0.118em] text-gold-soft">
                DURING THE FORUM
              </p>
              <p class="text-[17px] font-extrabold leading-[1.35] tracking-[-0.024em] text-white">
                On-site desk at Santika Premiere Dyandra, Medan
              </p>
              <p class="text-[13px] leading-[1.7] text-white/70">
                2–4 December 2026, 07:30–18:00. Registration, media desk and partner lounge on Level 2.
              </p>
            </div>
          </aside>
        </div>
      </SiteContainer>
    </section>

    <!-- Quick answers -->
    <section class="border-t border-ink/16 bg-white py-16 lg:pb-[72px] lg:pt-16">
      <SiteContainer>
        <div class="flex flex-col gap-6">
          <SiteEyebrow>BEFORE YOU WRITE</SiteEyebrow>
          <dl class="grid gap-8 md:grid-cols-3">
            <div v-for="qa in QUICK_ANSWERS" :key="qa.q" class="flex flex-col gap-2.5 border-t border-ink/16 pt-5">
              <dt class="text-[17px] font-extrabold leading-[1.3] tracking-[-0.018em] text-ink">
                {{ qa.q }}
              </dt>
              <dd class="text-[15px] leading-[1.7] text-prose">
                {{ qa.a }}
              </dd>
            </div>
          </dl>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
