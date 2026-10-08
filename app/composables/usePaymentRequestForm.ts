import { BKASH_DIGITS_LENGTH } from '~/constants/billing'
import { toAsciiDigits } from '~/utils/phone'

/**
 * The "I've paid" form: the user enters the last digits of the bKash number they paid from.
 *
 * @returns `last4` model, field `fieldError`, store-backed `submitStatus`/`submitError`, plan
 *          details, the user's `monthlyFee` and `extraFarms`, `latestRequest`,
 *          `hasPendingRequest` and `handleSubmit()`.
 */
export const usePaymentRequestForm = () => {
  const { t } = useI18n()
  const billingStore = useBillingStore()
  const { plan, monthlyFee, extraFarms, latestRequest, hasPendingRequest, submitStatus, submitError, status, error } =
    storeToRefs(billingStore)

  const last4 = ref('')
  const fieldError = ref<string | undefined>()
  const digitsPattern = new RegExp(`^\\d{${BKASH_DIGITS_LENGTH}}$`)

  const handleSubmit = async () => {
    const digits = toAsciiDigits(last4.value.trim())
    if (!digitsPattern.test(digits)) {
      fieldError.value = t('billing.request.digitsError', { count: BKASH_DIGITS_LENGTH })
      return
    }
    fieldError.value = undefined
    await billingStore.submitPaymentRequest(digits)
    if (submitStatus.value === 'success') last4.value = ''
  }

  return {
    last4,
    fieldError,
    plan,
    monthlyFee,
    extraFarms,
    latestRequest,
    hasPendingRequest,
    loadStatus: status,
    loadError: error,
    submitStatus,
    submitError,
    reload: billingStore.load,
    handleSubmit,
  }
}
