import { TEXT_LIMITS } from '~/constants/farm'
import { ROUTES } from '~/constants/routes'
import { createFarm, deleteFarm, farmHasData, fetchFarm, fetchFarmsPage, updateFarm } from '~/services/farms.service'
import type { Farm, FarmInput } from '~/types/models'

/** Paginated list of the user's farms ("Load more"). Loads the first page immediately. */
export const useFarmList = () => {
  const uid = useSessionUid()
  const list = usePagination((page) => fetchFarmsPage(uid(), page))
  list.reset()
  return list
}

/** A single farm by id, for the farm page. */
export const useFarm = (farmId: MaybeRefOrGetter<string>) => {
  const uid = useSessionUid()
  const state = useAsyncState(() => fetchFarm(uid(), toValue(farmId)))
  watch(() => toValue(farmId), () => state.execute(), { immediate: true })
  return state
}

/** Create/edit form for farms. */
export const useFarmForm = (onSaved?: () => void) => {
  const uid = useSessionUid()
  const validators = useValidators()

  return useEntityForm<FarmInput, Farm>({
    empty: () => ({ name: '', address: '' }),
    fromEntity: ({ name, address }) => ({ name, address }),
    validate: (values) => ({
      name: validators.text(values.name, { required: true, max: TEXT_LIMITS.short }),
      address: validators.text(values.address, { max: TEXT_LIMITS.medium }),
    }),
    save: (values, editing) => {
      const input = { name: values.name.trim(), address: values.address.trim() }
      return editing ? updateFarm(uid(), editing.id, input) : createFarm(uid(), input)
    },
    onSaved,
  })
}

/** Deletes an empty farm, then returns to the farm list. */
export const useFarmDelete = () => {
  const uid = useSessionUid()
  return useDeleteAction<Farm>({
    isBlocked: (farm) => farmHasData(uid(), farm.id),
    blockedErrorKey: 'farms.deleteBlocked',
    remove: (farm) => deleteFarm(uid(), farm.id),
    onDeleted: () => navigateTo(ROUTES.farms),
  })
}
