import { DEFAULT_GRANT_MONTHS, MAX_GRANT_MONTHS } from '~/constants/billing'
import { approvePaymentRequest, deleteSubscription, fetchSubscription, saveSubscription } from '~/services/billing.service'
import type { PaymentRequest, SubscriptionGrant } from '~/types/models'
import type { Result } from '~/types/network'
import { addMonths, isIsoDate, parseIsoDate, todayIsoDate, toIsoDate } from '~/utils/date'
import { resolveGrantPeriod } from '~/utils/subscription'

export interface GrantTarget {
  userId: string
  userName: string
  userPhone: string
  /** Set when approving a payment request. */
  request: PaymentRequest | null
}

/**
 * Admin: the access-grant modal. Defaults to one month (extending any active period); the admin
 * can change the number of months, grant free lifetime access, pick an exact date range, or revoke.
 *
 * @param onSaved called with the target after a grant or revoke succeeds.
 */
export const useSubscriptionGrant = (onSaved: (target: GrantTarget) => void) => {
  const { t } = useI18n()
  const { uid } = storeToRefs(useAuthStore())

  const isOpen = ref(false)
  const target = shallowRef<GrantTarget | null>(null)
  const mode = ref<SubscriptionGrant['mode']>('months')
  const months = ref(DEFAULT_GRANT_MONTHS)
  const startDate = ref('')
  const endDate = ref('')
  const rangeError = ref<string | undefined>()
  // Month grants extend the current period, so it must be known before saving.
  const current = useAsyncState(fetchSubscription)
  const save = useAsyncState((action: () => Promise<Result<unknown>>) => action())

  const open = (next: GrantTarget) => {
    target.value = next
    mode.value = 'months'
    months.value = DEFAULT_GRANT_MONTHS
    startDate.value = todayIsoDate()
    endDate.value = toIsoDate(addMonths(new Date(), DEFAULT_GRANT_MONTHS))
    rangeError.value = undefined
    save.reset()
    isOpen.value = true
    current.execute(next.userId)
  }

  const grant = computed<SubscriptionGrant>(() => {
    if (mode.value === 'lifetime') return { mode: 'lifetime' }
    if (mode.value === 'range') return { mode: 'range', startDate: startDate.value, endDate: endDate.value }
    return { mode: 'months', months: Math.min(MAX_GRANT_MONTHS, Math.max(1, months.value)) }
  })

  const isRangeValid = computed(
    () => isIsoDate(startDate.value) && isIsoDate(endDate.value) && parseIsoDate(startDate.value) <= parseIsoDate(endDate.value),
  )

  /** The period that will be saved, for the preview line. */
  const preview = computed(() => {
    if (mode.value === 'range' && !isRangeValid.value) return null
    return resolveGrantPeriod(grant.value, current.data.value)
  })

  const finish = async (action: () => Promise<Result<unknown>>) => {
    const next = target.value
    if (!next) return
    const result = await save.execute(action)
    if (result.error) return
    isOpen.value = false
    onSaved(next)
  }

  const handleSubmit = () => {
    const next = target.value
    const adminId = uid.value
    if (!next || !adminId || current.status.value !== 'success') return
    rangeError.value = mode.value === 'range' && !isRangeValid.value ? t('admin.grant.rangeError') : undefined
    if (rangeError.value) return
    const period = resolveGrantPeriod(grant.value, current.data.value)
    return finish(() =>
      next.request ? approvePaymentRequest(next.request, period, adminId) : saveSubscription(next.userId, period, adminId),
    )
  }

  const handleRevoke = () => {
    const next = target.value
    if (next) return finish(() => deleteSubscription(next.userId))
  }

  return {
    isOpen,
    target,
    current: current.data,
    currentStatus: current.status,
    mode,
    months,
    startDate,
    endDate,
    preview,
    status: save.status,
    error: computed(() => save.error.value ?? current.error.value),
    rangeError,
    open,
    handleSubmit,
    handleRevoke,
  }
}
