import { fetchLatestRecord, sumRecordFields } from '~/services/records.service'
import type { Batch } from '~/types/models'
import type { AppError, RequestStatus } from '~/types/network'
import { daysBetween, parseIsoDate } from '~/utils/date'

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

/**
 * Batch performance figures, computed from aggregate queries (one read per 1000 records)
 * instead of downloading every record.
 *
 * @param batch getter for the loaded batch (stats load once it is available).
 * @returns `stats`, `status`, `error` and `refresh()` (call after records change).
 */
export const useBatchStats = (batch: () => Batch | null) => {
  const uid = useSessionUid()
  const stats = shallowRef<BatchStats | null>(null)
  const status = ref<RequestStatus>('idle')
  const error = shallowRef<AppError | null>(null)

  const refresh = async () => {
    const current = batch()
    if (!current) return
    const scope = { farmId: current.farmId, batchId: current.id }
    status.value = 'loading'
    error.value = null

    const [mortality, feed, expenses, sales, latestWeight] = await Promise.all([
      sumRecordFields(uid(), 'mortalities', scope, ['count']),
      sumRecordFields(uid(), 'feeds', scope, ['consumption']),
      sumRecordFields(uid(), 'expenses', scope, ['amount']),
      sumRecordFields(uid(), 'sales', scope, ['quantity', 'weight', 'totalAmount']),
      fetchLatestRecord(uid(), 'weights', scope),
    ])
    const firstError = mortality.error ?? feed.error ?? expenses.error ?? sales.error ?? latestWeight.error
    if (firstError) {
      error.value = firstError
      status.value = 'error'
      return
    }

    const dead = mortality.data!.count
    const sold = sales.data!.quantity
    const alive = Math.max(0, current.initialQuantity - dead - sold)
    const latestWeightGrams = typeof latestWeight.data?.values.averageWeight === 'number' ? latestWeight.data.values.averageWeight : null
    // Simplified FCR = feed eaten ÷ live weight produced, where live weight = weight already
    // sold + birds still alive × latest sampled average weight. Chick placement weight is ignored.
    const liveWeightKg = sales.data!.weight + (latestWeightGrams ? (alive * latestWeightGrams) / 1000 : 0)
    const feedKg = feed.data!.consumption

    stats.value = {
      ageDays: Math.max(0, daysBetween(parseIsoDate(current.startDate), new Date())),
      initialQuantity: current.initialQuantity,
      mortality: dead,
      mortalityRate: current.initialQuantity ? (dead / current.initialQuantity) * 100 : 0,
      sold,
      alive,
      feedKg,
      latestWeightGrams,
      fcr: liveWeightKg > 0 && feedKg > 0 ? feedKg / liveWeightKg : null,
      expenses: expenses.data!.amount,
      sales: sales.data!.totalAmount,
      profit: sales.data!.totalAmount - expenses.data!.amount,
    }
    status.value = 'success'
  }

  watch(() => batch()?.id, (id) => id && refresh(), { immediate: true })

  return { stats, status, error, refresh }
}
