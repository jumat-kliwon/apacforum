<template>
  <div class="flex min-h-dvh flex-col bg-muted">
    <header class="sticky top-0 z-20 border-b border-default bg-default">
      <div class="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <NuxtLink to="/" class="flex items-center gap-3">
          <span class="flex size-8 items-center justify-center rounded-sm bg-brand-400 text-[15px] font-extrabold text-(--brand-ink)">A</span>
          <span class="flex flex-col leading-tight">
            <span class="text-[15px] font-bold text-highlighted">APCR</span>
            <span class="text-xs text-muted">ASEAN Public Communication &amp; Reputation Forum</span>
          </span>
        </NuxtLink>
      </div>
    </header>
    <main class="mx-auto flex w-full max-w-6xl grow flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <slot />
    </main>
    <footer class="border-t border-default bg-default">
      <div class="mx-auto w-full max-w-6xl px-4 py-6 text-[13px] text-muted sm:px-6">
        apcrforum.com
      </div>
    </footer>
  </div>
</template>
