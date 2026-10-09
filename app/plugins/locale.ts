import { LOCALE_COOKIE, SUPPORTED_LOCALES } from '~/constants/i18n'
import { isOneOf } from '~/utils/guards'

/**
 * Restores the visitor's saved language before the first render.
 *
 * Browser-language detection is disabled (see nuxt.config.ts) so first-time visitors always
 * get Bangla; this plugin only applies a choice the visitor made explicitly. Runs on the server
 * too, so SSR output is already in the right language and there is no flash on hydration.
 */
export default defineNuxtPlugin({
  name: 'app-locale',
  dependsOn: ['i18n:plugin'],
  async setup(nuxtApp) {
    const saved = useCookie<string | null>(LOCALE_COOKIE).value
    const i18n = nuxtApp.$i18n

    if (!isOneOf(SUPPORTED_LOCALES, saved) || saved === i18n.locale.value) return
    await i18n.setLocale(saved)
  },
})
