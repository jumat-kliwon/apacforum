<script setup lang="ts">
/** Grey bars standing in for copy the client has not supplied yet. */
withDefaults(defineProps<{ lines?: number, pairs?: boolean }>(), { lines: 4 })
</script>

<template>
  <div class="flex flex-col gap-3 border-t border-ink/16 pb-1 pt-[18px]" aria-hidden="true">
    <template v-if="pairs">
      <div v-for="n in lines" :key="n" class="flex flex-col gap-[7px]">
        <div class="h-[9px] w-full rounded-[2px] bg-ink/12" />
        <div class="h-[7px] w-[110px] rounded-[2px] bg-ink/6" />
      </div>
    </template>
    <template v-else>
      <div v-for="n in lines" :key="n" class="h-[9px] w-full rounded-[2px] bg-ink/12" />
      <div class="h-[7px] w-[120px] rounded-[2px] bg-ink/6" />
    </template>
  </div>
</template>
