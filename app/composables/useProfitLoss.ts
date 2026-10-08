import { fetchFinanceRecords, type FinanceScope } from '~/services/records.service'
import type { AppError, RequestStatus } from '~/types/network'
import type { FarmRecord } from '~/types/records'
import { buildProfitLoss, NO_FILTER } from '~/utils/profitLoss'

/**
 * Profit & loss for one batch, one farm or the whole business, with "what if" toggles.
 * Records are loaded once per scope; ticking categories or batches on and off only recomputes,
 * so it costs no extra reads.
 *
 * @param scope getter for the scope: `{ farmId, batchId }`, `{ farmId }`, `null` for all farms,
 *              or `undefined` while it isn't known yet (nothing is loaded until it is).
 * @returns load state (`status`, `error`, `reload`), the toggles (`excludedCategories`,
 *          `excludedBatchKeys`, `includeAll()`), `report` (with the toggles applied),
 *          `actualTotals` (everything included), `isFiltered` and `hasData`.
 */
export const useProfitLoss = (scope: () => FinanceScope | undefined) => {
  const uid = useSessionUid()
  const records = shallowRef<{ expenses: FarmRecord[]; sales: FarmRecord[] } | null>(null)
  const status = ref<RequestStatus>('idle')
  const error = shallowRef<AppError | null>(null)
  const excludedCategories = ref<string[]>([])
  const excludedBatchKeys = ref<string[]>([])
  let latestCall = 0

  const reload = async () => {
    const current = scope()
    if (current === undefined) return
    const call = ++latestCall
    status.value = 'loading'
    error.value = null
    const result = await fetchFinanceRecords(uid(), current)
    // A newer scope or reload has started; its result wins.
    if (call !== latestCall) return
    if (result.error) {
      error.value = result.error
      status.value = 'error'
      return
    }
    records.value = result.data
    status.value = 'success'
  }

  const includeAll = () => {
    excludedCategories.value = []
    excludedBatchKeys.value = []
  }

  // Toggles belong to one scope, so a new scope starts with everything included.
  watch(
    () => JSON.stringify(scope() ?? 'pending'),
    () => {
      includeAll()
      records.value = null
      reload()
    },
    { immediate: true },
  )

  const report = computed(() =>
    records.value
      ? buildProfitLoss(records.value.expenses, records.value.sales, {
          excludedCategories: excludedCategories.value,
          excludedBatchKeys: excludedBatchKeys.value,
        })
      : null,
  )
  const actualTotals = computed(() =>
    records.value ? buildProfitLoss(records.value.expenses, records.value.sales, NO_FILTER).totals : null,
  )
  const isFiltered = computed(() => excludedCategories.value.length > 0 || excludedBatchKeys.value.length > 0)
  const hasData = computed(() => !!records.value && records.value.expenses.length + records.value.sales.length > 0)

  return {
    status,
    error,
    reload,
    excludedCategories,
    excludedBatchKeys,
    includeAll,
    report,
    actualTotals,
    isFiltered,
    hasData,
  }
}
