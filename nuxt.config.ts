export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'APCR',
      titleTemplate: '%s · APCR'
    }
  },
  routeRules: {
    // the CMS renders in the browser only (the session is checked in middleware)
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
    // Vercel sets VERCEL=1 during its build; elsewhere build a standalone Bun server
    preset: process.env.NITRO_PRESET || (process.env.VERCEL ? 'vercel' : 'bun'),
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      // invoices past their deadline → expired
      '*/5 * * * *': ['payments:expire'],
      // reminder 24 hours before the payment deadline
      '*/15 * * * *': ['payments:remind'],
      // 3-day reminder and next-day thank-you, every morning at 08:00 WIB (01:00 UTC)
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
