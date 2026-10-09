<script setup lang="ts">
import { CreditCard } from '@lucide/vue'
import { INCLUDED_FARMS } from '~/constants/billing'
import type { PaymentRequestStatus } from '~/types/models'
import type { Tone } from '~/types/ui'

/** Account page card: access status, monthly fee and the latest payment request. */
const { t } = useI18n()
const { formatDate } = useLocaleDate()
const { formatMoney, formatNumber } = useLocaleNumber()
const { isAdmin } = storeToRefs(useAuthStore())
const billingStore = useBillingStore()
const { subscription, latestRequest, hasPendingRequest, canWrite, isPaying, status, error, plan, farmCount, extraFarms, monthlyFee } =
  storeToRefs(billingStore)
const { openPaymentModal } = useWriteAccess()

const REQUEST_TONES: Record<PaymentRequestStatus, Tone> = { pending: 'blue', approved: 'green', rejected: 'red' }

// e.g. "3 farms: 2 included + 1 extra × ৳100"
const farmsSummary = computed(() =>
  plan.value
    ? t('account.farmsSummary', {
        farms: formatNumber(farmCount.value),
        included: formatNumber(INCLUDED_FARMS),
        extra: formatNumber(extraFarms.value),
        price: formatMoney(plan.value.extraFarmPrice),
      })
    : '',
)
</script>

<template>
  <BaseCard>
    <template #header>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('account.subscription') }}</h2>
    </template>
    <BaseAsyncState :status="status" :error="error" @retry="billingStore.load">
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <BaseBadge v-if="isAdmin" tone="purple">{{ t('account.adminAccess') }}</BaseBadge>
          <SubscriptionBadge v-else :subscription="subscription" />
          <BaseButton v-if="isPaying && !hasPendingRequest" :variant="canWrite ? 'outline' : 'primary'" @click="openPaymentModal">
            <template #icon-left><CreditCard class="w-4 h-4" /></template>
            {{ canWrite ? t('billing.banner.renew') : t('billing.banner.subscribe') }}
          </BaseButton>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ canWrite ? t('account.canWrite') : t('account.readOnly') }}</p>
        <BasePanel v-if="monthlyFee !== null">
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('account.monthlyFee') }}</p>
          <p class="text-lg font-bold text-slate-900 dark:text-white">{{ formatMoney(monthlyFee) }}</p>
          <p class="text-sm text-slate-600 dark:text-slate-300">{{ farmsSummary }}</p>
        </BasePanel>
        <div v-if="latestRequest" class="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span>{{ t('account.latestRequest', { digits: latestRequest.bkashLast4, date: formatDate(latestRequest.createdAt) }) }}</span>
          <BaseBadge :tone="REQUEST_TONES[latestRequest.status]">{{ t(`billing.requestStatus.${latestRequest.status}`) }}</BaseBadge>
        </div>
      </div>
    </BaseAsyncState>
  </BaseCard>
</template>
