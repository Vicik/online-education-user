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
    description: '面向中国用户的在线课程、考试与学习社区。',
  },
  runtimeConfig: {
    apiBaseInternal: 'http://localhost:8080',
    public: {
      apiBase: '/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },
  routeRules: {
    '/': { swr: 300 },
    '/login': {
      robots: false,
      headers: { 'cache-control': 'private, no-store, max-age=0' },
    },
    '/exam/attempt/**': {
      robots: false,
      headers: { 'cache-control': 'private, no-store, max-age=0' },
    },
    '/account/**': {
      robots: false,
      headers: { 'cache-control': 'private, no-store, max-age=0' },
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
  robots: {
    sitemap: '/sitemap_index.xml',
  },
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: '知序学堂',
    },
  },
  sitemap: {
    sitemaps: {
      pages: {
        includeAppSources: true,
      },
      courses: {
        sources: ['/__sitemap__/courses'],
      },
      exams: {
        sources: ['/__sitemap__/exams'],
      },
      promotions: {
        sources: ['/__sitemap__/promotions'],
      },
      community: {
        sources: ['/__sitemap__/community'],
      },
    },
  },
})
