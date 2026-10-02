import { BD_PHONE_PATTERN, PHONE_AUTH_EMAIL_DOMAIN } from '~/constants/auth'

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯'

/** Replaces Bengali digits (০-৯) with ASCII digits; Bangla keyboards type them by default. */
export const toAsciiDigits = (value: string) =>
  value.replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)))

/**
 * Normalizes a Bangladeshi mobile number to its 11-digit local form (`01XXXXXXXXX`).
 * Accepts Bengali digits, spaces/dashes and the `+880` / `880` country prefixes.
 *
 * @returns the normalized number, or `null` when it isn't a valid BD mobile number.
 */
export const normalizeBdPhone = (raw: string): string | null => {
  const digits = toAsciiDigits(raw).replace(/[\s\-().]/g, '')
  const local = digits.replace(/^(\+?880|00880)/, '0')
  return BD_PHONE_PATTERN.test(local) ? local : null
}

/** The synthetic Firebase Auth email for a normalized phone number (see `constants/auth.ts`). */
export const phoneToAuthEmail = (phone: string) => `${phone}@${PHONE_AUTH_EMAIL_DOMAIN}`

/** Reverse of `phoneToAuthEmail`; `null` for accounts that weren't created with a phone. */
export const authEmailToPhone = (email: string | null) => {
  const suffix = `@${PHONE_AUTH_EMAIL_DOMAIN}`
  return email?.endsWith(suffix) ? email.slice(0, -suffix.length) : null
}
