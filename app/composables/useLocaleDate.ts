import type { IsoDate } from '~/types/models'
import { parseIsoDate } from '~/utils/date'

/**
 * Locale-aware date formatting (Bengali month names and digits in `bn`).
 *
 * @returns `formatDate(value)` for a `Date` or `YYYY-MM-DD` string; empty string for null.
 */
export const useLocaleDate = () => {
  const { localeProperties } = useI18n()

  const formatDate = (value: Date | IsoDate | null | undefined, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) => {
    if (!value) return ''
    const date = typeof value === 'string' ? parseIsoDate(value) : value
    return new Intl.DateTimeFormat(localeProperties.value.language, options).format(date)
  }

  return { formatDate }
}
