import { SUPPORTED_LOCALES, type AppLocale } from '~/constants/i18n'

/** Type guard: true when `value` is one of the locales the app ships translations for. */
export const isAppLocale = (value: unknown): value is AppLocale =>
  typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value)
