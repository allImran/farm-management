import { fetchLatestRecord, sumRecordFields } from '~/services/records.service'
import type { Batch } from '~/types/models'
import { computeBatchStats } from '~/utils/batchStats'
import { combineResults, mapResult } from '~/utils/result'

/**
 * Batch performance figures (see `computeBatchStats`), from aggregate queries (one read per
 * 1000 records) instead of downloading every record.
 *
 * @param batch getter for the loaded batch (stats load once it is available).
 * @returns `stats`, `status`, `error` and `refresh()` (call after records change).
 */
export const useBatchStats = (batch: () => Batch | null) => {
  const uid = useSessionUid()

  const state = useAsyncState(async (current: Batch) => {
    const scope = { farmId: current.farmId, batchId: current.id }
    const results = await Promise.all([
      sumRecordFields(uid(), 'mortalities', scope, ['count']),
      sumRecordFields(uid(), 'feeds', scope, ['consumption']),
      sumRecordFields(uid(), 'expenses', scope, ['amount']),
      sumRecordFields(uid(), 'sales', scope, ['quantity', 'weight', 'totalAmount']),
      fetchLatestRecord(uid(), 'weights', scope),
    ])
    return mapResult(combineResults(results), ([mortality, feed, expenses, sales, latestWeight]) => {
      const grams = latestWeight?.values.averageWeight
      return computeBatchStats(current, {
        deaths: mortality.count,
        feedKg: feed.consumption,
        expenses: expenses.amount,
        sold: { birds: sales.quantity, weightKg: sales.weight, amount: sales.totalAmount },
        latestWeightGrams: typeof grams === 'number' ? grams : null,
      })
    })
  })

  const refresh = async () => {
    const current = batch()
    if (current) await state.execute(current)
  }

  watch(() => batch()?.id, refresh, { immediate: true })

  return { stats: state.data, status: state.status, error: state.error, refresh }
}
