import { APP_NAME, APP_THEME_COLOR } from './app/constants/app'
import { DEFAULT_LOCALE } from './app/constants/i18n'

// Signed-in pages depend on Firebase Auth, which only exists in the browser, so they are
// rendered on the client. The marketing page is prerendered by `nuxt generate` for SEO;
// everything else is served by the SPA fallback (see firebase.json).
const CLIENT_ONLY_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/dashboard',
  '/farms/**',
  '/batches/**',
  '/contacts/**',
  '/account',
  '/admin/**',
] as const

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n', '@pinia/nuxt'],
  components: [{ path: '~/components', pathPrefix: false }],
  routeRules: Object.fromEntries(CLIENT_ONLY_ROUTES.map((route) => [route, { ssr: false }])),
  runtimeConfig: {
    // The app is deployed as a static site (`nuxt generate`), so every value here is public.
    public: {
      firebaseApiKey: '',
      firebaseAuthDomain: '',
      firebaseProjectId: '',
      firebaseStorageBucket: '',
      firebaseMessagingSenderId: '',
      firebaseAppId: '',
      // 'true' connects the client to the local Emulator Suite.
      firebaseUseEmulators: '',
      // OAuth client ID (Google Cloud console) the admin signs in with to approve password resets.
      googleOauthClientId: '',
      // Optional Slack incoming webhook for new payment requests. Empty = no notifications.
      slackWebhookUrl: '',
    },
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
    // Styles live in main.css; pages with fixed children opt into `fade` via definePageMeta.
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      // Per-page titles, descriptions and social tags are set in app.vue and the pages.
      title: APP_NAME,
      meta: [
        { name: 'application-name', content: APP_NAME },
        { name: 'apple-mobile-web-app-title', content: APP_NAME },
        { name: 'theme-color', content: APP_THEME_COLOR },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
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
