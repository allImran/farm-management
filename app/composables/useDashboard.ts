import { summarizeBatches } from '~/services/batches.service'
import { countFarms } from '~/services/farms.service'
import { combineResults, mapResult } from '~/utils/result'

/** Number of active batches previewed on the dashboard. */
const ACTIVE_BATCH_PREVIEW = 6

/**
 * Dashboard data: headline counts plus the most recent active batches.
 *
 * @returns `summary` ({ farms, activeBatches, birds }), its `status`/`error`/`reload`, and
 *          `activeBatches`, a pagination list limited to the preview size.
 */
export const useDashboard = () => {
  const uid = useSessionUid()

  const { data: summary, status, error, execute: reload } = useAsyncState(async () => {
    const results = await Promise.all([countFarms(uid()), summarizeBatches(uid(), { status: 'active' })])
    return mapResult(combineResults(results), ([farms, active]) => ({ farms, activeBatches: active.batches, birds: active.birds }))
  })
  reload()

  const activeBatches = useBatchList(() => ({ status: 'active' }), ACTIVE_BATCH_PREVIEW)

  return { summary, status, error, reload, activeBatches }
}
