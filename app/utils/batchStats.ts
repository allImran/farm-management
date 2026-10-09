import type { Batch } from '~/types/models'
import { daysSince } from './date'

export interface BatchStats {
  ageDays: number
  initialQuantity: number
  mortality: number
  /** Deaths as % of chicks placed. */
  mortalityRate: number
  sold: number
  /** Birds still on the farm: placed − dead − sold. */
  alive: number
  feedKg: number
  /** Latest sampled average body weight, grams. */
  latestWeightGrams: number | null
  /** Feed conversion ratio; `null` until there is weight data. */
  fcr: number | null
  expenses: number
  sales: number
  profit: number
}

export interface BatchTotals {
  deaths: number
  feedKg: number
  expenses: number
  sold: { birds: number; weightKg: number; amount: number }
  latestWeightGrams: number | null
}

/**
 * Batch performance figures from the record totals.
 *
 * FCR (feed conversion ratio) is simplified to feed eaten ÷ live weight produced, where live
 * weight = weight already sold + birds still alive × latest sampled average weight. The chicks'
 * weight at placement is ignored.
 */
export const computeBatchStats = (
  batch: Pick<Batch, 'startDate' | 'initialQuantity'>,
  totals: BatchTotals,
  now = new Date(),
): BatchStats => {
  const placed = batch.initialQuantity
  const alive = Math.max(0, placed - totals.deaths - totals.sold.birds)
  const liveWeightKg = totals.sold.weightKg + (totals.latestWeightGrams ? (alive * totals.latestWeightGrams) / 1000 : 0)

  return {
    ageDays: daysSince(batch.startDate, now),
    initialQuantity: placed,
    mortality: totals.deaths,
    mortalityRate: placed ? (totals.deaths / placed) * 100 : 0,
    sold: totals.sold.birds,
    alive,
    feedKg: totals.feedKg,
    latestWeightGrams: totals.latestWeightGrams,
    fcr: liveWeightKg > 0 && totals.feedKg > 0 ? totals.feedKg / liveWeightKg : null,
    expenses: totals.expenses,
    sales: totals.sold.amount,
    profit: totals.sold.amount - totals.expenses,
  }
}
