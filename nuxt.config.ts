export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'APCR',
      titleTemplate: '%s · APCR',
      // the globe emblem from the APCR logo
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  },
  routeRules: {
    // the CMS renders in the browser only (the session is checked in middleware)
    '/admin/**': { ssr: false },
    '/login': { ssr: false },
    // public ticket scanner: the link carries a secret key, so keep it out of search engines and referrers
    '/scan/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' } }
  },
  colorMode: {
    preference: 'light'
  },
  // ship every icon the app names in the client bundle: no /api/_nuxt_icon round trips after each navigation
  icon: {
    clientBundle: {
      scan: { globInclude: ['app/**/*.{vue,ts}', 'shared/**/*.ts'] },
      sizeLimitKb: 512
    }
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
      // NUXT_PUBLIC_SITE_URL; empty falls back to BETTER_AUTH_URL / the Vercel URL (server/services/context.ts)
      siteUrl: '',
      // the same R2_PUBLIC_URL the server uses; NUXT_PUBLIC_R2_PUBLIC_URL still overrides it at runtime
      r2PublicUrl: process.env.R2_PUBLIC_URL || ''
    }
  }
})
