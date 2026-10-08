import { fetchAllRecordsInScope } from '~/services/records.service'
import type { Batch } from '~/types/models'
import type { AppError, RequestStatus } from '~/types/network'
import type { FarmRecord } from '~/types/records'
import { buildBatchSeries } from '~/utils/batchSeries'
import { daysBetween, parseIsoDate } from '~/utils/date'

/**
 * Day-by-day growth, mortality and feed series for the batch charts.
 *
 * @param batch getter for the loaded batch (loads once it is available).
 * @returns `series` (see `buildBatchSeries`), `hasWeights`/`hasDeaths`/`hasFeed`, `status`,
 *          `error` and `refresh()` (call after records change).
 */
export const useBatchSeries = (batch: () => Batch | null) => {
  const uid = useSessionUid()
  const records = shallowRef<{ batchId: string; mortalities: FarmRecord[]; feeds: FarmRecord[]; weights: FarmRecord[] } | null>(null)
  const status = ref<RequestStatus>('idle')
  const error = shallowRef<AppError | null>(null)
  let latestCall = 0

  const refresh = async () => {
    const current = batch()
    if (!current) return
    const call = ++latestCall
    const scope = { farmId: current.farmId, batchId: current.id }
    status.value = 'loading'
    error.value = null

    const [mortalities, feeds, weights] = await Promise.all([
      fetchAllRecordsInScope(uid(), 'mortalities', scope),
      fetchAllRecordsInScope(uid(), 'feeds', scope),
      fetchAllRecordsInScope(uid(), 'weights', scope),
    ])
    if (call !== latestCall) return
    const firstError = mortalities.error ?? feeds.error ?? weights.error
    if (firstError) {
      error.value = firstError
      status.value = 'error'
      return
    }
    records.value = { batchId: current.id, mortalities: mortalities.data!, feeds: feeds.data!, weights: weights.data! }
    status.value = 'success'
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
    const throughDay = current.status === 'active' ? daysBetween(parseIsoDate(current.startDate), new Date()) : 0
    return buildBatchSeries({ mortalities, feeds, weights, startDate: current.startDate, initialQuantity: current.initialQuantity, throughDay })
  })

  const hasWeights = computed(() => !!records.value?.weights.length)
  const hasDeaths = computed(() => !!records.value?.mortalities.length)
  const hasFeed = computed(() => !!records.value?.feeds.length)

  return { series, hasWeights, hasDeaths, hasFeed, status, error, refresh }
}
