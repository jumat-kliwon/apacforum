<script setup lang="ts">
import { AT_A_GLANCE, COUNTRIES, TOPICS, WHATSAPP_DISPLAY } from '~/data/contact'
import { WHATSAPP_URL } from '~/data/site'

definePageMeta({ layout: 'site' })

useSeoMeta({
  title: 'Contact',
  description: 'Contact APCR 2026 — the ASEAN Public Communication & Reputation Forum, 2–4 December 2026 in Medan, North Sumatra, Indonesia — via WhatsApp.',
  themeColor: '#031735'
})

const registerHref = await useRegisterHref('/apcr-2026#registration')

/**
 * There is no submission endpoint for this form, so it does not pretend to send:
 * it composes the enquiry as a WhatsApp message to APCR's published number.
 */
const form = reactive({ name: '', institution: '', position: '', country: '', email: '', topic: '', message: '' })

const whatsappHref = computed(() => {
  const body = [
    `Topic: ${form.topic || 'General enquiry'}`,
    `Name: ${form.name}`,
    `Institution: ${form.institution}`,
    `Position: ${form.position}`,
    `Country: ${form.country}`,
    `Email: ${form.email}`,
    '',
    form.message
  ].join('\n')
  return `${WHATSAPP_URL}?text=${encodeURIComponent(body)}`
})

const fieldClass = 'h-[46px] w-full rounded-[2px] border border-ink/16 bg-paper-soft px-3.5 text-[14px] text-ink placeholder:text-prose-dim'
const labelClass = 'text-[12px] font-bold text-ink'
</script>

<template>
  <div>
    <SiteHero
      eyebrow="CONTACT"
      title="LET'S CONNECT."
      blurb="APCR is reached via WhatsApp. Message us directly, or fill in the form below and it will be composed as a WhatsApp message for you."
      title-class="text-[clamp(38px,6vw,72px)] leading-none tracking-[-0.047em]"
    >
      <template #actions>
        <SiteButton :to="WHATSAPP_URL" icon="i-lucide-arrow-up-right">
          Contact via WhatsApp
        </SiteButton>
      </template>
    </SiteHero>

    <!-- WhatsApp -->
    <section id="whatsapp" class="py-20 lg:pb-[76px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-[30px]">
          <SiteSectionHead eyebrow="WHO TO CONTACT" title="ONE CHANNEL: WHATSAPP.">
            <template #intro>
              Registration, partnership, media or anything else about APCR 2026 — send it to the same number.
            </template>
          </SiteSectionHead>

          <div class="flex flex-col gap-6 border-t border-ink/16 pt-[26px] md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-4">
              <span class="flex size-12 shrink-0 items-center justify-center rounded-[2px] bg-navy-deep">
                <UIcon name="i-lucide-message-circle" class="size-[22px] text-gold-soft" />
              </span>
              <div class="flex flex-col gap-1">
                <p class="text-[11px] font-extrabold tracking-[0.118em] text-navy">
                  WHATSAPP
                </p>
                <a :href="WHATSAPP_URL" target="_blank" rel="noopener" class="text-[clamp(24px,2.7vw,32px)] font-extrabold leading-[1.12] tracking-[-0.038em] text-ink hover:underline">
                  {{ WHATSAPP_DISPLAY }}
                </a>
              </div>
            </div>
            <SiteButton :to="WHATSAPP_URL" variant="navy" icon="i-lucide-arrow-up-right" class="self-start md:self-auto">
              Contact via WhatsApp
            </SiteButton>
          </div>
        </div>
      </SiteContainer>
    </section>

    <!-- Message form -->
    <section id="message" class="bg-paper py-20 lg:pb-[86px] lg:pt-20">
      <SiteContainer>
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <form class="flex flex-1 flex-col gap-[22px] rounded-[2px] border border-ink/16 bg-white px-6 pb-[42px] pt-10 sm:px-10" @submit.prevent>
            <SiteEyebrow>SEND A MESSAGE</SiteEyebrow>
            <h2 class="text-[clamp(24px,2.7vw,32px)] font-extrabold leading-[1.12] tracking-[-0.038em] text-ink">
              TELL US WHAT YOU NEED.
            </h2>

            <div class="grid gap-[18px] sm:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-name">Name</label>
                <input id="c-name" v-model="form.name" :class="fieldClass" placeholder="Your full name">
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-inst">Institution</label>
                <input id="c-inst" v-model="form.institution" :class="fieldClass" placeholder="Ministry, company or university">
              </div>
              <div class="flex flex-col gap-2">
                <label :class="labelClass" for="c-pos">Position</label>
                <input id="c-pos" v-model="form.position" :class="fieldClass" placeholder="Your role">
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
                <label :class="labelClass" for="c-topic">Topic</label>
                <select id="c-topic" v-model="form.topic" :class="[fieldClass, !form.topic && 'text-prose-dim']">
                  <option value="" disabled>
                    Select a topic
                  </option>
                  <option v-for="t in TOPICS" :key="t" :value="t">
                    {{ t }}
                  </option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label :class="labelClass" for="c-message">Message</label>
              <textarea
                id="c-message"
                v-model="form.message"
                rows="5"
                class="w-full rounded-[2px] border border-ink/16 bg-paper-soft px-3.5 py-3 text-[14px] text-ink placeholder:text-prose-dim"
                placeholder="Tell us briefly what you need."
              />
            </div>

            <div class="flex flex-wrap items-center justify-between gap-5 pt-1.5">
              <SiteButton :to="whatsappHref" variant="navy" icon="i-lucide-arrow-up-right">
                Send via WhatsApp
              </SiteButton>
              <p class="text-[12px] text-prose-dim">
                Opens WhatsApp with your message ready to send to {{ WHATSAPP_DISPLAY }}
              </p>
            </div>
          </form>

          <aside class="flex flex-col gap-5 lg:w-[350px] lg:shrink-0">
            <div class="flex flex-col gap-4 rounded-[2px] bg-navy-deep px-6 pb-[26px] pt-6">
              <p class="text-[11px] font-extrabold tracking-[0.118em] text-gold-soft">
                APCR 2026 AT A GLANCE
              </p>
              <dl class="flex flex-col">
                <div
                  v-for="(row, i) in AT_A_GLANCE"
                  :key="row.label"
                  class="flex flex-col gap-1 py-3"
                  :class="i > 0 && 'border-t border-white/16'"
                >
                  <dt class="text-[12px] text-white/60">
                    {{ row.label }}
                  </dt>
                  <dd class="text-[15px] font-bold leading-[1.5] text-white">
                    {{ row.value }}
                  </dd>
                </div>
              </dl>
              <SiteButton :to="registerHref" icon="i-lucide-arrow-right" class="self-start">
                Register for APCR 2026
              </SiteButton>
            </div>
          </aside>
        </div>
      </SiteContainer>
    </section>
  </div>
</template>
