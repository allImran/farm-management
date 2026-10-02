/** Locale codes supported by the app. Bangla is the default for every visitor. */
export const DEFAULT_LOCALE = 'bn'
export const SUPPORTED_LOCALES = ['bn', 'en'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

/** Cookie that remembers a visitor's explicit language choice (SSR-readable). */
export const LOCALE_COOKIE = 'locale'
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
