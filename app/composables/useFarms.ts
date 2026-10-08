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

/**
 * Create/edit form for farms. Adding a farm beyond the ones every subscription includes first
 * asks the user to agree to the monthly extra-farm fee; the form opens once they agree.
 *
 * @returns the entity form (see `useEntityForm`) with `openCreate()` replaced by the checked
 *          version, plus `isExtraFeeOpen`, `isCheckingFarms` and `confirmExtraFee()`.
 */
export const useFarmForm = (onSaved?: () => void) => {
  const uid = useSessionUid()
  const validators = useValidators()
  const billingStore = useBillingStore()
  const { canWrite, isNextFarmExtra } = storeToRefs(billingStore)

  const isExtraFeeOpen = ref(false)
  const isCheckingFarms = ref(false)
  // Only the farm the user agreed to pay for carries the agreement.
  let hasAcceptedExtraFee = false

  const form = useEntityForm<FarmInput, Farm>({
    empty: () => ({ name: '', address: '' }),
    fromEntity: ({ name, address }) => ({ name, address }),
    validate: (values) => ({
      name: validators.text(values.name, { required: true, max: TEXT_LIMITS.short }),
      address: validators.text(values.address, { max: TEXT_LIMITS.medium }),
    }),
    save: (values, editing) => {
      const input = { name: values.name.trim(), address: values.address.trim() }
      return editing ? updateFarm(uid(), editing.id, input) : createFarm(uid(), input, hasAcceptedExtraFee)
    },
    onSaved: () => {
      billingStore.refreshFarmCount()
      onSaved?.()
    },
  })

  /** Opens the new-farm form, asking for the extra-farm fee agreement first when it applies. */
  const openCreate = async () => {
    hasAcceptedExtraFee = false
    // Without write access the form's own check shows the payment modal instead.
    if (!canWrite.value) return form.openCreate()
    // A fresh count, so a farm added on another device is taken into account.
    isCheckingFarms.value = true
    await billingStore.refreshFarmCount()
    isCheckingFarms.value = false
    if (isNextFarmExtra.value) isExtraFeeOpen.value = true
    else form.openCreate()
  }

  const confirmExtraFee = () => {
    hasAcceptedExtraFee = true
    isExtraFeeOpen.value = false
    form.openCreate()
  }

  return { ...form, openCreate, isExtraFeeOpen, isCheckingFarms, confirmExtraFee }
}

/** Deletes an empty farm, then returns to the farm list. */
export const useFarmDelete = () => {
  const uid = useSessionUid()
  const billingStore = useBillingStore()
  return useDeleteAction<Farm>({
    isBlocked: (farm) => farmHasData(uid(), farm.id),
    blockedErrorKey: 'farms.deleteBlocked',
    remove: (farm) => deleteFarm(uid(), farm.id),
    onDeleted: () => {
      billingStore.refreshFarmCount()
      return navigateTo(ROUTES.farms)
    },
  })
}
