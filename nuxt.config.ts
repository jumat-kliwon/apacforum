export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'APCR',
      titleTemplate: '%s · APCR'
    }
  },
  routeRules: {
    // CMS dirender di browser saja (session dicek di middleware)
    '/admin/**': { ssr: false },
    '/login': { ssr: false }
  },
  colorMode: {
    preference: 'light'
  },
  fonts: {
    families: [
      { name: 'Rethink Sans', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] }
    ]
  },
  nitro: {
    preset: 'bun',
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      // tagihan lewat batas → kedaluwarsa
      '*/5 * * * *': ['payments:expire'],
      // pengingat 24 jam sebelum batas bayar
      '*/15 * * * *': ['payments:remind'],
      // pengingat H-3 & terima kasih H+1, tiap pagi 08.00 WIB (01.00 UTC)
      '0 1 * * *': ['events:notify']
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: 'http://localhost:3000',
      r2PublicUrl: ''
    }
  }
})
