import type { IsoDate } from '~/types/models'

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 24 * 60 * 60 * 1000

const pad = (value: number) => String(value).padStart(2, '0')

/** Formats a date as `YYYY-MM-DD` in local time. */
export const toIsoDate = (date: Date): IsoDate =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const todayIsoDate = (): IsoDate => toIsoDate(new Date())

/** Parses `YYYY-MM-DD` as local midnight (`new Date(string)` would parse it as UTC). */
export const parseIsoDate = (value: IsoDate) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
}

export const isIsoDate = (value: unknown): value is IsoDate =>
  typeof value === 'string' && ISO_DATE_PATTERN.test(value) && toIsoDate(parseIsoDate(value)) === value

/**
 * Adds calendar months, clamping to the last day of the target month
 * (Jan 31 + 1 month = Feb 28/29, not Mar 3).
 */
export const addMonths = (date: Date, months: number) => {
  const result = new Date(date)
  const day = result.getDate()
  result.setMonth(result.getMonth() + months)
  if (result.getDate() !== day) result.setDate(0)
  return result
}

export const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

/** Whole calendar days from `from` to `to`; rounding absorbs daylight-saving shifts. */
export const daysBetween = (from: Date, to: Date) =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS)

/** Whole days since `date` (0 for today or a future date), e.g. a batch's age in days. */
export const daysSince = (date: IsoDate, now = new Date()) => Math.max(0, daysBetween(parseIsoDate(date), now))
