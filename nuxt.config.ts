import { DEFAULT_LOCALE } from './app/constants/i18n'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  components: [{ path: '~/components', pathPrefix: false }],
  colorMode: {
    classSuffix: '',
  },
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    // Same URLs for every language; the choice lives in a cookie (see plugins/locale.ts).
    strategy: 'no_prefix',
    // Browser detection is off on purpose: most visitors have English browsers, but the
    // product must open in Bangla until the visitor explicitly switches.
    detectBrowserLanguage: false,
    locales: [
      { code: 'bn', language: 'bn-BD', name: 'বাংলা', file: 'bn.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
  },
  app: {
    head: {
      title: 'Solvex Broiler Management',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
})
