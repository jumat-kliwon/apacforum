<!-- Public site shell: the header and footer from docs/design/apcr-design.pen. -->
<template>
  <div class="site flex min-h-dvh flex-col">
    <SiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
