<script setup lang="ts">
/** Gold-edged band flagging a section whose real content the client still owes us. */
defineProps<{ title: string }>()
</script>

<template>
  <div class="flex gap-3.5 border-l-[3px] border-gold bg-paper px-6 py-5">
    <UIcon name="i-lucide-info" class="mt-0.5 size-[18px] shrink-0 text-[#9a7320]" />
    <div class="flex flex-col gap-1.5">
      <p class="text-[14px] font-extrabold text-ink">
        {{ title }}
      </p>
      <p class="text-[14px] leading-[1.7] text-prose">
        <slot />
      </p>
    </div>
  </div>
</template>
