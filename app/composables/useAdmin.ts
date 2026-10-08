import { DEFAULT_GRANT_MONTHS, MAX_GRANT_MONTHS } from '~/constants/billing'
import { TEXT_LIMITS } from '~/constants/farm'
import {
  approvePaymentRequest,
  deleteSubscription,
  fetchPaymentRequestsPage,
  fetchPlanConfig,
  fetchSubscription,
  fetchSubscriptionsByUserIds,
  rejectPaymentRequest,
  saveSubscription,
  savePlanConfig,
} from '~/services/billing.service'
import { countFarmsByUser } from '~/services/farms.service'
import { fetchUsersPage } from '~/services/users.service'
import type { PaymentRequest, PaymentRequestStatus, PlanConfig, Subscription, SubscriptionGrant, UserProfile } from '~/types/models'
import type { AppError, RequestStatus } from '~/types/network'
import { addMonths, isIsoDate, parseIsoDate, todayIsoDate, toIsoDate } from '~/utils/date'
import { normalizeBdPhone } from '~/utils/phone'
import { resolveGrantPeriod } from '~/utils/subscription'

/**
 * Admin-only logic: reviewing bKash requests, managing user access and the plan settings.
 * The `admin` middleware hides these pages; `firestore.rules` is what actually blocks others.
 */

/** Payment requests with one status, as numbered pages. */
export const useAdminPaymentRequests = (status: () => PaymentRequestStatus) => {
  const list = usePagination((page) => fetchPaymentRequestsPage(page, status()), { mode: 'pages' })
  watch(status, () => list.reset(), { immediate: true })

  // Each requester's current farm count, so the admin can check the paid amount covers extra farms.
  const farmCounts = shallowRef<Record<string, number>>({})
  watch(list.items, async (requests) => {
    farmCounts.value = {}
    if (!requests.length) return
    const result = await countFarmsByUser(requests.map((request) => request.userId))
    if (!result.error) farmCounts.value = result.data
  })

  return { ...list, farmCounts }
}

/**
 * All users as numbered pages, with each page's subscriptions fetched alongside.
 *
 * @param phoneSearch getter for a phone search term; a valid BD number narrows to that user.
 */
export const useAdminUsers = (phoneSearch: () => string) => {
  const phone = computed(() => normalizeBdPhone(phoneSearch()))
  const list = usePagination((page) => fetchUsersPage(page, { phone: phone.value }), { mode: 'pages' })
  watch(phone, () => list.reset(), { immediate: true })

  const subscriptions = shallowRef<Record<string, Subscription>>({})
  const subscriptionsError = shallowRef<AppError | null>(null)
  const loadSubscriptions = async (users: UserProfile[]) => {
    if (!users.length) return
    const result = await fetchSubscriptionsByUserIds(users.map((user) => user.id))
    subscriptionsError.value = result.error
    if (result.data) subscriptions.value = { ...subscriptions.value, ...result.data }
  }
  watch(list.items, loadSubscriptions)

  /** Refreshes one user's subscription after the admin changes it. */
  const refreshSubscription = async (userId: string) => {
    const result = await fetchSubscription(userId)
    if (result.error) return
    const next = { ...subscriptions.value }
    if (result.data) next[userId] = result.data
    else delete next[userId]
    subscriptions.value = next
  }

  return { ...list, subscriptions, subscriptionsError, refreshSubscription }
}

export interface GrantTarget {
  userId: string
  userName: string
  userPhone: string
  /** Set when approving a payment request. */
  request: PaymentRequest | null
}

/**
 * The access-grant modal. Defaults to one month (extending any active period); the admin can
 * change the number of months, grant free lifetime access, pick an exact date range, or revoke.
 */
export const useSubscriptionGrant = (onSaved: (target: GrantTarget) => void) => {
  const { t } = useI18n()
  const { uid } = storeToRefs(useAuthStore())

  const isOpen = ref(false)
  const target = shallowRef<GrantTarget | null>(null)
  const current = shallowRef<Subscription | null>(null)
  const currentStatus = ref<RequestStatus>('idle')
  const mode = ref<SubscriptionGrant['mode']>('months')
  const months = ref(DEFAULT_GRANT_MONTHS)
  const startDate = ref(todayIsoDate())
  const endDate = ref(toIsoDate(addMonths(new Date(), DEFAULT_GRANT_MONTHS)))
  const status = ref<RequestStatus>('idle')
  const error = shallowRef<AppError | null>(null)
  const rangeError = ref<string | undefined>()

  const open = async (next: GrantTarget) => {
    target.value = next
    mode.value = 'months'
    months.value = DEFAULT_GRANT_MONTHS
    startDate.value = todayIsoDate()
    endDate.value = toIsoDate(addMonths(new Date(), DEFAULT_GRANT_MONTHS))
    status.value = 'idle'
    error.value = null
    rangeError.value = undefined
    current.value = null
    isOpen.value = true

    // Month grants extend the current period, so it must be known before saving.
    currentStatus.value = 'loading'
    const result = await fetchSubscription(next.userId)
    if (target.value !== next) return
    current.value = result.data
    error.value = result.error
    currentStatus.value = result.error ? 'error' : 'success'
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
    return resolveGrantPeriod(grant.value, current.value)
  })

  const handleSubmit = async () => {
    const next = target.value
    if (!next || !uid.value || currentStatus.value !== 'success') return
    if (mode.value === 'range' && !isRangeValid.value) {
      rangeError.value = t('admin.grant.rangeError')
      return
    }
    rangeError.value = undefined
    status.value = 'loading'
    error.value = null
    const period = resolveGrantPeriod(grant.value, current.value)
    const result = next.request
      ? await approvePaymentRequest(next.request, period, uid.value)
      : await saveSubscription(next.userId, period, uid.value)
    if (result.error) {
      error.value = result.error
      status.value = 'error'
      return
    }
    status.value = 'success'
    isOpen.value = false
    onSaved(next)
  }

  const handleRevoke = async () => {
    const next = target.value
    if (!next) return
    status.value = 'loading'
    error.value = null
    const result = await deleteSubscription(next.userId)
    if (result.error) {
      error.value = result.error
      status.value = 'error'
      return
    }
    status.value = 'success'
    isOpen.value = false
    onSaved(next)
  }

  return {
    isOpen,
    target,
    current,
    currentStatus,
    mode,
    months,
    startDate,
    endDate,
    preview,
    status,
    error,
    rangeError,
    open,
    handleSubmit,
    handleRevoke,
  }
}

/** Reject-a-request dialog with an optional note shown to the user. */
export const useRejectRequest = (onRejected: () => void) => {
  const { uid } = storeToRefs(useAuthStore())
  const isOpen = ref(false)
  const target = shallowRef<PaymentRequest | null>(null)
  const note = ref('')
  const state = useAsyncState((requestId: string, adminId: string, reviewNote: string | null) =>
    rejectPaymentRequest(requestId, adminId, reviewNote),
  )

  const open = (request: PaymentRequest) => {
    target.value = request
    note.value = ''
    state.error.value = null
    isOpen.value = true
  }

  const confirm = async () => {
    if (!target.value || !uid.value) return
    const result = await state.execute(target.value.id, uid.value, note.value.trim() || null)
    if (result.error) return
    isOpen.value = false
    onRejected()
  }

  return { isOpen, target, note, status: state.status, error: state.error, open, confirm }
}

/** Load/save the plan shown to users in the payment modal. */
export const usePlanSettings = () => {
  const { t } = useI18n()
  const { uid } = storeToRefs(useAuthStore())
  const validators = useValidators()

  const billingStore = useBillingStore()
  const values = reactive({ monthlyPrice: '', extraFarmPrice: '', bkashNumber: '', instructions: '' })
  const errors = ref<Record<string, string | undefined>>({})
  const load = useAsyncState(fetchPlanConfig)
  const save = useAsyncState((plan: PlanConfig, adminId: string) => savePlanConfig(plan, adminId))
  const isSaved = ref(false)

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
    errors.value = {
      monthlyPrice: validators.number(values.monthlyPrice, { required: true, min: 0 }),
      extraFarmPrice: validators.number(values.extraFarmPrice, { required: true, min: 0 }),
      bkashNumber: normalizeBdPhone(values.bkashNumber) ? undefined : t('validation.phone'),
      instructions: validators.text(values.instructions, { max: TEXT_LIMITS.note }),
    }
    if (Object.values(errors.value).some(Boolean) || !uid.value) return
    isSaved.value = false
    const result = await save.execute(
      {
        monthlyPrice: Number(values.monthlyPrice),
        extraFarmPrice: Number(values.extraFarmPrice),
        bkashNumber: normalizeBdPhone(values.bkashNumber) ?? '',
        instructions: values.instructions.trim(),
      },
      uid.value,
    )
    if (result.error) return
    isSaved.value = true
    // The admin's own copy of the plan feeds the expected amounts on payment requests.
    billingStore.load()
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
