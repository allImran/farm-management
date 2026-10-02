import { summarizeBatches } from '~/services/batches.service'
import { countFarms } from '~/services/farms.service'
import type { AppError, RequestStatus } from '~/types/network'

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
  const summary = shallowRef<{ farms: number; activeBatches: number; birds: number } | null>(null)
  const status = ref<RequestStatus>('idle')
  const error = shallowRef<AppError | null>(null)

  const reload = async () => {
    status.value = 'loading'
    error.value = null
    const [farms, active] = await Promise.all([countFarms(uid()), summarizeBatches(uid(), { status: 'active' })])
    const firstError = farms.error ?? active.error
    if (firstError) {
      error.value = firstError
      status.value = 'error'
      return
    }
    summary.value = { farms: farms.data!, activeBatches: active.data!.batches, birds: active.data!.birds }
    status.value = 'success'
  }
  reload()

  const activeBatches = useBatchList(() => ({ status: 'active' }), ACTIVE_BATCH_PREVIEW)

  return { summary, status, error, reload, activeBatches }
}
