import { fetchAllRecordsInScope } from '~/services/records.service'
import type { Batch } from '~/types/models'
import { buildBatchSeries } from '~/utils/batchSeries'
import { daysSince } from '~/utils/date'
import { combineResults, mapResult } from '~/utils/result'

/**
 * Day-by-day growth, mortality and feed series for the batch charts.
 *
 * @param batch getter for the loaded batch (loads once it is available).
 * @returns `series` (see `buildBatchSeries`), `hasWeights`/`hasDeaths`/`hasFeed`, `status`,
 *          `error` and `refresh()` (call after records change).
 */
export const useBatchSeries = (batch: () => Batch | null) => {
  const uid = useSessionUid()

  const state = useAsyncState(async (current: Batch) => {
    const scope = { farmId: current.farmId, batchId: current.id }
    const results = await Promise.all([
      fetchAllRecordsInScope(uid(), 'mortalities', scope),
      fetchAllRecordsInScope(uid(), 'feeds', scope),
      fetchAllRecordsInScope(uid(), 'weights', scope),
    ])
    return mapResult(combineResults(results), ([mortalities, feeds, weights]) => ({ batchId: current.id, mortalities, feeds, weights }))
  })
  const records = state.data

  const refresh = async () => {
    const current = batch()
    if (current) await state.execute(current)
  }

  // Reload when a different batch is shown; edits to the same batch (dates, chick count)
  // only change the computed series.
  watch(() => batch()?.id, refresh, { immediate: true })

  const series = computed(() => {
    const current = batch()
    // Records of the previous batch are never drawn against a newly opened one.
    if (!current || records.value?.batchId !== current.id) return null
    const { mortalities, feeds, weights } = records.value
    // A running batch's axis reaches today, so a gap in recording is visible.
    const throughDay = current.status === 'active' ? daysSince(current.startDate) : 0
    return buildBatchSeries({ mortalities, feeds, weights, startDate: current.startDate, initialQuantity: current.initialQuantity, throughDay })
  })

  const hasWeights = computed(() => !!records.value?.weights.length)
  const hasDeaths = computed(() => !!records.value?.mortalities.length)
  const hasFeed = computed(() => !!records.value?.feeds.length)

  return { series, hasWeights, hasDeaths, hasFeed, status: state.status, error: state.error, refresh }
}
