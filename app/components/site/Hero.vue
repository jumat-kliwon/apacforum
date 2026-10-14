<script setup lang="ts">
/** The navy page hero shared by knowledge, community, partners, news and contact. */
withDefaults(defineProps<{
  eyebrow: string
  /** Newlines are honoured, matching the line breaks in the design. */
  title: string
  blurb?: string
  titleClass?: string
}>(), { titleClass: 'text-[clamp(34px,5.4vw,64px)] leading-none tracking-[-0.047em]' })

const slots = useSlots()
</script>

<template>
  <section class="bg-navy-deep py-20 lg:pb-20 lg:pt-[84px]">
    <SiteContainer>
      <div class="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-[72px]">
        <div class="flex flex-col gap-6 lg:w-[700px] lg:shrink-0">
          <SiteEyebrow dark>
            {{ eyebrow }}
          </SiteEyebrow>
          <h1 class="font-extrabold text-white" :class="titleClass" style="white-space: pre-line">{{ title }}</h1>
          <p v-if="blurb" class="text-[19px] leading-[1.68] text-white/85">
            {{ blurb }}
          </p>
          <slot name="under" />
          <div v-if="slots.actions" class="flex flex-wrap items-center gap-3 pt-2">
            <slot name="actions" />
          </div>
        </div>
        <slot name="aside" />
      </div>
    </SiteContainer>
  </section>
</template>
