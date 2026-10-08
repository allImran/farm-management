import { useIntervalFn } from '@vueuse/core'
import {
  createPaymentRequest,
  fetchLatestPaymentRequest,
  fetchPlanConfig,
  fetchSubscription,
  notifyPaymentRequest,
} from '~/services/billing.service'
import { countFarms } from '~/services/farms.service'
import type { PaymentRequest, PlanConfig, Subscription } from '~/types/models'
import type { AppError, RequestStatus } from '~/types/network'
import { extraFarmCount, getSubscriptionState, hasWriteAccess, monthlyFee as calculateMonthlyFee, needsExtraFarmConsent } from '~/utils/subscription'

/**
 * The signed-in user's write access: subscription, latest payment request, plan details and
 * the farm count that sets the monthly fee. Reloads whenever the signed-in account changes.
 */
export const useBillingStore = defineStore('billing', () => {
  const authStore = useAuthStore()
  const { slackWebhookUrl } = useRuntimeConfig().public
  const { uid, isAdmin, profile } = storeToRefs(authStore)

  const subscription = ref<Subscription | null>(null)
  const latestRequest = ref<PaymentRequest | null>(null)
  const plan = ref<PlanConfig | null>(null)
  const farmCount = ref(0)
  const status = ref<RequestStatus>('idle')
  const error = ref<AppError | null>(null)
  const submitStatus = ref<RequestStatus>('idle')
  const submitError = ref<AppError | null>(null)

  // Re-evaluated every minute so access ends on time in a long-open tab.
  const now = shallowRef(new Date())
  useIntervalFn(() => {
    now.value = new Date()
  }, 60_000)
  const subscriptionState = computed(() => getSubscriptionState(subscription.value, now.value))
  /** UX hint only; `firestore.rules` is the real check. */
  const canWrite = computed(() => isAdmin.value || hasWriteAccess(subscriptionState.value))
  const hasPendingRequest = computed(() => latestRequest.value?.status === 'pending')
  /** Free-forever users and the admin never pay, so they have no monthly fee. */
  const isPaying = computed(() => !isAdmin.value && subscriptionState.value !== 'lifetime')
  const extraFarms = computed(() => (isPaying.value ? extraFarmCount(farmCount.value) : 0))
  /** `null` until the plan is loaded, or for users who don't pay. */
  const monthlyFee = computed(() => (plan.value && isPaying.value ? calculateMonthlyFee(plan.value, farmCount.value) : null))
  /** Whether the next farm raises the monthly fee (the user must agree first). */
  const isNextFarmExtra = computed(() => needsExtraFarmConsent(farmCount.value, subscriptionState.value, isAdmin.value))

  const load = async () => {
    if (!uid.value) return
    status.value = 'loading'
    error.value = null
    const [subscriptionResult, requestResult, planResult, farmCountResult] = await Promise.all([
      fetchSubscription(uid.value),
      fetchLatestPaymentRequest(uid.value),
      fetchPlanConfig(),
      countFarms(uid.value),
    ])
    const firstError = subscriptionResult.error ?? requestResult.error ?? planResult.error ?? farmCountResult.error
    if (firstError) {
      error.value = firstError
      status.value = 'error'
      return
    }
    subscription.value = subscriptionResult.data
    latestRequest.value = requestResult.data
    plan.value = planResult.data
    farmCount.value = farmCountResult.data!
    status.value = 'success'
  }

  /**
   * Re-counts the user's farms (after adding or deleting one, or right before deciding whether
   * a new farm is an extra one). Keeps the last known count if the count can't be read.
   */
  const refreshFarmCount = async () => {
    if (!uid.value) return
    const result = await countFarms(uid.value)
    if (!result.error) farmCount.value = result.data
  }

  const reset = () => {
    subscription.value = null
    latestRequest.value = null
    plan.value = null
    farmCount.value = 0
    status.value = 'idle'
    error.value = null
  }

  watch(uid, (next) => (next ? load() : reset()), { immediate: true })

  /** Files a bKash payment request and pings the admin on Slack (best effort). */
  const submitPaymentRequest = async (bkashLast4: string) => {
    if (!uid.value || !profile.value) return
    submitStatus.value = 'loading'
    submitError.value = null
    const input = { userId: uid.value, userName: profile.value.name, userPhone: profile.value.phone, bkashLast4 }
    const result = await createPaymentRequest(input)
    if (result.error) {
      submitError.value = result.error
      submitStatus.value = 'error'
      return
    }
    // The request is saved either way; a failed notification only means no Slack ping.
    if (slackWebhookUrl) void notifyPaymentRequest(slackWebhookUrl, input)
    await load()
    submitStatus.value = 'success'
  }

  return {
    subscription,
    latestRequest,
    plan,
    farmCount,
    extraFarms,
    monthlyFee,
    isNextFarmExtra,
    status,
    error,
    submitStatus,
    submitError,
    subscriptionState,
    canWrite,
    hasPendingRequest,
    load,
    refreshFarmCount,
    submitPaymentRequest,
  }
})
