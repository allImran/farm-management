import { TEXT_LIMITS } from '~/constants/farm'
import { ROUTES } from '~/constants/routes'
import {
  batchHasRecords,
  createBatch,
  deleteBatch,
  fetchAllFarmBatches,
  fetchBatch,
  fetchBatchesPage,
  updateBatch,
  type BatchFilters,
} from '~/services/batches.service'
import type { Batch, BatchInput, BatchStatus } from '~/types/models'
import { todayIsoDate } from '~/utils/date'

/**
 * Paginated batches ("Load more"), newest first. Reloads from page one whenever the filters change.
 *
 * @param filters getter for `{ farmId, status }`.
 */
export const useBatchList = (filters: () => BatchFilters, pageSize?: number) => {
  const uid = useSessionUid()
  const list = usePagination((page) => fetchBatchesPage(uid(), page, filters()), { pageSize })
  watch(filters, () => list.reset(), { immediate: true, deep: true })
  return list
}

/**
 * Every batch of a farm (not paged), for the profit & loss batch picker.
 *
 * @param farmId getter for the farm; changing it reloads.
 * @returns `data` (batches, newest first), `status`, `error` and `execute()` to reload.
 */
export const useAllFarmBatches = (farmId: () => string) => {
  const uid = useSessionUid()
  const state = useAsyncState(() => fetchAllFarmBatches(uid(), farmId()))
  watch(farmId, () => state.execute(), { immediate: true })
  return state
}

/** A single batch by id, for the batch page. */
export const useBatch = (batchId: MaybeRefOrGetter<string>) => {
  const uid = useSessionUid()
  const state = useAsyncState(() => fetchBatch(uid(), toValue(batchId)))
  watch(() => toValue(batchId), () => state.execute(), { immediate: true })
  return state
}

type BatchFormValues = Omit<BatchInput, 'farmId' | 'initialQuantity'> & { initialQuantity: string }

/**
 * Create/edit form for batches.
 *
 * @param farmId getter for the farm new batches are created on.
 */
export const useBatchForm = (farmId: () => string, onSaved?: () => void) => {
  const uid = useSessionUid()
  const validators = useValidators()

  return useEntityForm<BatchFormValues, Batch>({
    empty: () => ({ name: '', breed: '', startDate: todayIsoDate(), initialQuantity: '', status: 'active', note: '' }),
    fromEntity: (batch) => ({
      name: batch.name,
      breed: batch.breed,
      startDate: batch.startDate,
      initialQuantity: String(batch.initialQuantity),
      status: batch.status,
      note: batch.note,
    }),
    validate: (values) => ({
      name: validators.text(values.name, { required: true, max: TEXT_LIMITS.short }),
      breed: validators.text(values.breed, { max: TEXT_LIMITS.short }),
      startDate: validators.date(values.startDate),
      initialQuantity: validators.number(values.initialQuantity, { required: true, min: 1, isInteger: true }),
      note: validators.text(values.note, { max: TEXT_LIMITS.note }),
    }),
    save: (values, editing) => {
      const input = {
        name: values.name.trim(),
        breed: values.breed.trim(),
        startDate: values.startDate,
        initialQuantity: Number(values.initialQuantity),
        status: values.status as BatchStatus,
        note: values.note.trim(),
      }
      return editing ? updateBatch(uid(), editing.id, input) : createBatch(uid(), { ...input, farmId: farmId() })
    },
    onSaved,
  })
}

/** Deletes a batch without records, then returns to its farm. */
export const useBatchDelete = () => {
  const uid = useSessionUid()
  return useDeleteAction<Batch>({
    isBlocked: (batch) => batchHasRecords(uid(), batch),
    blockedErrorKey: 'batches.deleteBlocked',
    remove: (batch) => deleteBatch(uid(), batch.id),
    onDeleted: (batch) => navigateTo(ROUTES.farm(batch.farmId)),
  })
}
