<script setup lang="ts">
import { FOOTER_BLURB, FOOTER_COLUMNS, FOOTER_LOGOS } from '~/data/site'

function isExternal(to?: string) {
  return !!to && /^https?:\/\//.test(to)
}
</script>

<template>
  <footer class="border-t border-ink/16 bg-white pb-[30px] pt-16">
    <SiteContainer>
      <div class="flex flex-col gap-9">
        <div class="flex flex-col gap-10 md:flex-row md:gap-[50px]">
          <div class="flex w-full flex-col gap-7 md:w-[295px] md:shrink-0">
            <div class="relative w-[180px] overflow-hidden" style="aspect-ratio: 82 / 35">
              <img
                src="/landing/apcr-logo.webp"
                alt="APCR"
                width="500"
                height="500"
                class="absolute left-[-21.342%] top-1/2 w-[142.683%] max-w-none -translate-y-[50.855%]"
              >
            </div>
            <p class="text-[13px]/[22px] text-prose">
              <template v-for="(line, i) in FOOTER_BLURB" :key="i">
                {{ line }}<br>
              </template>
            </p>
          </div>

          <div v-for="col in FOOTER_COLUMNS" :key="col.title" class="flex-1">
            <h2 class="text-[12px]/[18px] font-bold tracking-[0.12em] text-navy">
              {{ col.title }}
            </h2>
            <ul class="mt-[17px] space-y-3">
              <li v-for="link in col.links" :key="link.label">
                <NuxtLink v-if="link.to && !isExternal(link.to)" :to="link.to" class="text-[14px]/[21px] text-prose transition-colors hover:text-navy">
                  {{ link.label }}
                </NuxtLink>
                <a v-else-if="link.to" :href="link.to" target="_blank" rel="noopener" class="text-[14px]/[21px] text-prose transition-colors hover:text-navy">
                  {{ link.label }}
                </a>
                <span v-else class="text-[14px]/[21px] text-ink/35" aria-disabled="true">{{ link.label }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="flex flex-wrap gap-10 border-t border-ink/16 pt-[31px]">
          <div v-for="logo in FOOTER_LOGOS" :key="logo.label" class="flex flex-col gap-[18px]">
            <p class="text-[12px]/[18px] tracking-[0.08em] text-navy">
              {{ logo.label }}
            </p>
            <img :src="logo.src" :alt="logo.alt" width="190" height="85" class="h-[85px] w-[190px] object-contain object-center">
          </div>
        </div>

        <div class="flex flex-wrap justify-between gap-5 border-t border-ink/16 pt-[19px] text-[12px]/[18px] text-prose">
          <p>ASEAN Public Communication &amp; Reputation Forum (APCR)</p>
          <p>Initiated by PR INDONESIA</p>
        </div>
      </div>
    </SiteContainer>
  </footer>
</template>
