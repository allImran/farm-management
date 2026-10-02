<script setup lang="ts">
import { EXPIRY_WARNING_DAYS } from '~/constants/billing'
import { daysBetween } from '~/utils/date'

/** Top-of-page notice: read-only mode, request under review, or access about to end. */
const { t } = useI18n()
const { formatDate } = useLocaleDate()
const billingStore = useBillingStore()
const { status, subscription, subscriptionState, hasPendingRequest, canWrite } = storeToRefs(billingStore)
const { isAdmin } = storeToRefs(useAuthStore())
const { openPaymentModal } = useWriteAccess()

const daysLeft = computed(() =>
  subscriptionState.value === 'active' && subscription.value?.endsAt ? daysBetween(new Date(), subscription.value.endsAt) : null,
)

const notice = computed(() => {
  if (status.value !== 'success' || isAdmin.value) return null
  if (hasPendingRequest.value && !canWrite.value) {
    return { variant: 'info' as const, title: t('billing.banner.pendingTitle'), body: t('billing.banner.pendingBody'), action: null }
  }
  if (!canWrite.value) {
    return {
      variant: 'warning' as const,
      title: t('billing.banner.readOnlyTitle'),
      body: t('billing.banner.readOnlyBody'),
      action: t('billing.banner.subscribe'),
    }
  }
  if (daysLeft.value !== null && daysLeft.value <= EXPIRY_WARNING_DAYS && !hasPendingRequest.value) {
    return {
      variant: 'warning' as const,
      title: t('billing.banner.expiringTitle', { date: formatDate(subscription.value?.endsAt) }),
      body: t('billing.banner.expiringBody'),
      action: t('billing.banner.renew'),
    }
  }
  return null
})
</script>

<template>
  <BaseAlert v-if="notice" :variant="notice.variant" :title="notice.title">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <span>{{ notice.body }}</span>
      <BaseButton v-if="notice.action" size="sm" @click="openPaymentModal">{{ notice.action }}</BaseButton>
    </div>
  </BaseAlert>
</template>
