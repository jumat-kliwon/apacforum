export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  nitro: {
    preset: 'bun'
  },
  runtimeConfig: {
    public: {
      r2PublicUrl: ''
    }
  }
})
