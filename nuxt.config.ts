export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
  ],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: '知序学堂',
  },
  runtimeConfig: {
    apiBaseInternal: 'http://localhost:8080',
    public: {
      apiBase: '/api',
    },
  },
  compatibilityDate: '2026-10-28',
  typescript: {
    strict: true,
    typeCheck: true,
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
