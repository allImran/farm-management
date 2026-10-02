import { useIntervalFn } from '@vueuse/core'
import {
  createPaymentRequest,
  fetchLatestPaymentRequest,
  fetchPlanConfig,
  fetchSubscription,
  notifyPaymentRequest,
} from '~/services/billing.service'
import type { PaymentRequest, PlanConfig, Subscription } from '~/types/models'
import type { AppError, RequestStatus } from '~/types/network'
import { getSubscriptionState, hasWriteAccess } from '~/utils/subscription'

/**
 * The signed-in user's write access: subscription, latest payment request and plan details.
 * Reloads whenever the signed-in account changes.
 */
export const useBillingStore = defineStore('billing', () => {
  const authStore = useAuthStore()
  const { slackWebhookUrl } = useRuntimeConfig().public
  const { uid, isAdmin, profile } = storeToRefs(authStore)

  const subscription = ref<Subscription | null>(null)
  const latestRequest = ref<PaymentRequest | null>(null)
  const plan = ref<PlanConfig | null>(null)
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

  const load = async () => {
    if (!uid.value) return
    status.value = 'loading'
    error.value = null
    const [subscriptionResult, requestResult, planResult] = await Promise.all([
      fetchSubscription(uid.value),
      fetchLatestPaymentRequest(uid.value),
      fetchPlanConfig(),
    ])
    const firstError = subscriptionResult.error ?? requestResult.error ?? planResult.error
    if (firstError) {
      error.value = firstError
      status.value = 'error'
      return
    }
    subscription.value = subscriptionResult.data
    latestRequest.value = requestResult.data
    plan.value = planResult.data
    status.value = 'success'
  }

  const reset = () => {
    subscription.value = null
    latestRequest.value = null
    plan.value = null
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
    status,
    error,
    submitStatus,
    submitError,
    subscriptionState,
    canWrite,
    hasPendingRequest,
    load,
    submitPaymentRequest,
  }
})
