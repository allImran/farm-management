import { TEXT_LIMITS } from '~/constants/farm'
import { fetchPlanConfig, savePlanConfig } from '~/services/billing.service'
import type { FormErrors } from '~/types/forms'
import { hasErrors } from '~/utils/forms'
import { normalizeBdPhone } from '~/utils/phone'

/**
 * Admin: load/save the plan shown to users in the payment modal.
 *
 * @returns form `values` and `errors`, load and save `status`/`error`, `isSaved`, `reload()` and `handleSubmit()`.
 */
export const usePlanSettings = () => {
  const { uid } = storeToRefs(useAuthStore())
  const billingStore = useBillingStore()
  const validators = useValidators()

  const values = reactive({ monthlyPrice: '', extraFarmPrice: '', bkashNumber: '', instructions: '' })
  const errors = ref<FormErrors<keyof typeof values>>({})
  const load = useAsyncState(fetchPlanConfig)
  const save = useAsyncState(savePlanConfig)
  const isSaved = computed(() => save.status.value === 'success')

  const reload = async () => {
    const result = await load.execute()
    if (!result.data) return
    values.monthlyPrice = result.data.monthlyPrice ? String(result.data.monthlyPrice) : ''
    values.extraFarmPrice = String(result.data.extraFarmPrice)
    values.bkashNumber = result.data.bkashNumber
    values.instructions = result.data.instructions
  }
  reload()

  const handleSubmit = async () => {
    save.reset()
    errors.value = {
      monthlyPrice: validators.number(values.monthlyPrice, { required: true, min: 0 }),
      extraFarmPrice: validators.number(values.extraFarmPrice, { required: true, min: 0 }),
      bkashNumber: validators.phone(values.bkashNumber),
      instructions: validators.text(values.instructions, { max: TEXT_LIMITS.note }),
    }
    if (hasErrors(errors.value) || !uid.value) return
    const plan = {
      monthlyPrice: Number(values.monthlyPrice),
      extraFarmPrice: Number(values.extraFarmPrice),
      bkashNumber: normalizeBdPhone(values.bkashNumber) ?? '',
      instructions: values.instructions.trim(),
    }
    const result = await save.execute(plan, uid.value)
    // The admin's own copy of the plan feeds the expected amounts on payment requests.
    if (!result.error) billingStore.load()
  }

  return {
    values,
    errors,
    loadStatus: load.status,
    loadError: load.error,
    saveStatus: save.status,
    saveError: save.error,
    isSaved,
    reload,
    handleSubmit,
  }
}
