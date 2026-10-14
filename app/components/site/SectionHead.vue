<script setup lang="ts">
/**
 * Eyebrow + headline that opens nearly every section, with the optional
 * supporting paragraph or link that sits beside it on wide screens.
 * The design bottom-aligns that second column with the headline.
 */
withDefaults(defineProps<{
  eyebrow: string
  title: string
  dark?: boolean
  /** Headline scale, matching the three sizes used in the design. */
  size?: 'xl' | 'lg' | 'md'
  /** Width of the headline column on desktop. */
  colClass?: string
}>(), { size: 'lg', colClass: 'lg:w-[660px]' })

const SIZES = {
  xl: 'text-[clamp(30px,4.2vw,50px)] leading-[1.05] tracking-[-0.042em]',
  lg: 'text-[clamp(28px,3.9vw,46px)] leading-[1.06] tracking-[-0.043em]',
  md: 'text-[clamp(27px,3.7vw,44px)] leading-[1.06] tracking-[-0.043em]'
}

const slots = useSlots()
</script>

<template>
  <div
    class="flex flex-col gap-6"
    :class="slots.action ? 'lg:flex-row lg:items-end lg:justify-between lg:gap-12' : (slots.intro ? 'lg:flex-row lg:items-end lg:gap-[72px]' : '')"
  >
    <div class="flex flex-col gap-5" :class="(slots.intro || slots.action) && `${colClass} lg:shrink-0`">
      <SiteEyebrow :dark="dark">
        {{ eyebrow }}
      </SiteEyebrow>
      <h2 class="font-extrabold" :class="[SIZES[size], dark ? 'text-white' : 'text-ink']" style="white-space: pre-line">{{ title }}</h2>
    </div>

    <p v-if="slots.intro" class="text-[16px] leading-[1.75]" :class="dark ? 'text-white/70' : 'text-prose'">
      <slot name="intro" />
    </p>
    <div v-if="slots.action" class="shrink-0 self-start lg:self-auto">
      <slot name="action" />
    </div>
  </div>
</template>
