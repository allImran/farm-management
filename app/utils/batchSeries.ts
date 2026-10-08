import { MAX_SERIES_DAYS } from '~/constants/charts'
import type { IsoDate } from '~/types/models'
import type { FarmRecord } from '~/types/records'
import { daysBetween, parseIsoDate } from './date'

/**
 * Day-by-day series for the batch charts, indexed by bird age in days (day 0 = placement).
 * Every series has one entry per day so all charts share the same x-axis.
 */
export interface BatchSeries {
  /** Ages shown on the x-axis: 0, 1, … last day. */
  days: number[]
  /** Average sampled body weight that day (grams); `null` on days without a sample. */
  weightGrams: (number | null)[]
  deaths: number[]
  /** Deaths so far as % of chicks placed. */
  cumulativeMortalityPct: number[]
  feedKg: number[]
  cumulativeFeedKg: number[]
}

export interface BatchSeriesInput {
  startDate: IsoDate
  initialQuantity: number
  /** Extend the axis to at least this age (today's age for a running batch). */
  throughDay?: number
  mortalities: readonly FarmRecord[]
  feeds: readonly FarmRecord[]
  weights: readonly FarmRecord[]
}

const toNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits

/**
 * Builds the chart series for one batch.
 *
 * Records dated before placement count on day 0 and records past `MAX_SERIES_DAYS` on the
 * last day, so the cumulative lines always end at the same totals as the batch stats.
 */
export const buildBatchSeries = (input: BatchSeriesInput): BatchSeries => {
  const start = parseIsoDate(input.startDate)
  const ageOf = (record: FarmRecord) => {
    const age = daysBetween(start, parseIsoDate(record.date))
    return Number.isFinite(age) ? Math.min(MAX_SERIES_DAYS, Math.max(0, age)) : 0
  }

  const allRecords = [...input.mortalities, ...input.feeds, ...input.weights]
  const throughDay = Number.isFinite(input.throughDay) ? Math.max(0, input.throughDay!) : 0
  const lastDay = Math.min(MAX_SERIES_DAYS, Math.max(throughDay, ...allRecords.map(ageOf)))
  const days = Array.from({ length: lastDay + 1 }, (_, day) => day)

  const deaths = days.map(() => 0)
  for (const record of input.mortalities) deaths[ageOf(record)]! += toNumber(record.values.count)

  const feedKg = days.map(() => 0)
  for (const record of input.feeds) feedKg[ageOf(record)]! += toNumber(record.values.consumption)

  // Several samples on one day are averaged.
  const weightSums = days.map(() => ({ total: 0, samples: 0 }))
  for (const record of input.weights) {
    const grams = record.values.averageWeight
    if (typeof grams !== 'number' || !Number.isFinite(grams)) continue
    const slot = weightSums[ageOf(record)]!
    slot.total += grams
    slot.samples += 1
  }

  let deathsSoFar = 0
  let feedSoFar = 0
  const placed = input.initialQuantity > 0 ? input.initialQuantity : 0

  return {
    days,
    weightGrams: weightSums.map(({ total, samples }) => (samples ? round(total / samples, 1) : null)),
    deaths,
    cumulativeMortalityPct: deaths.map((count) => {
      deathsSoFar += count
      return placed ? round((deathsSoFar / placed) * 100, 2) : 0
    }),
    feedKg: feedKg.map((kg) => round(kg, 2)),
    cumulativeFeedKg: feedKg.map((kg) => {
      feedSoFar += kg
      return round(feedSoFar, 2)
    }),
  }
}
