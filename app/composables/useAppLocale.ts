import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type AppLocale } from '~/constants/i18n'

/**
 * Current language plus a switcher that remembers the visitor's choice.
 *
 * @returns `locale` (reactive code), `locales` (configured locale list) and
 *          `switchLocale(code)` which changes language and persists it in a cookie.
 */
export const useAppLocale = () => {
  const { locale, locales, setLocale } = useI18n()
  const cookie = useCookie<string | null>(LOCALE_COOKIE, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  })

  const switchLocale = async (code: AppLocale) => {
    if (code === locale.value) return
    await setLocale(code)
    cookie.value = code
  }

  return { locale, locales, switchLocale }
}
