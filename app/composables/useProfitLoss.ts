import { fetchFinanceRecords, type FinanceScope } from '~/services/records.service'
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
  const { data: records, status, error, execute, reset } = useAsyncState((current: FinanceScope) => fetchFinanceRecords(uid(), current))
  const excludedCategories = ref<string[]>([])
  const excludedBatchKeys = ref<string[]>([])

  const reload = async () => {
    const current = scope()
    if (current !== undefined) await execute(current)
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
      reset()
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
