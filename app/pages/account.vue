<script setup lang="ts">
import { CreditCard } from '@lucide/vue'
import { INCLUDED_FARMS } from '~/constants/billing'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()
const { formatDate } = useLocaleDate()
const { isAdmin } = storeToRefs(useAuthStore())
const billingStore = useBillingStore()
const { subscription, subscriptionState, latestRequest, hasPendingRequest, canWrite, status, error, plan, farmCount, extraFarms, monthlyFee } =
  storeToRefs(billingStore)
// Free-forever users and the admin have nothing to pay or renew.
const canPay = computed(() => !isAdmin.value && subscriptionState.value !== 'lifetime')
const { formatMoney, formatNumber } = useLocaleNumber()

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
const { openPaymentModal } = useWriteAccess()
const { values, errors, error: saveError, isSubmitting, isSaved, phone, handleSubmit } = useProfileForm()

const REQUEST_TONES = { pending: 'blue', approved: 'green', rejected: 'red' } as const

useSeoMeta({ title: () => t('account.title') })
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <PageHeader :title="t('account.title')" />

    <BaseCard>
      <template #header>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('account.subscription') }}</h2>
      </template>
      <BaseAsyncState :status="status" :error="error" @retry="billingStore.load">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <BaseBadge v-if="isAdmin" tone="purple">{{ t('account.adminAccess') }}</BaseBadge>
            <SubscriptionBadge v-else :subscription="subscription" />
            <BaseButton v-if="canPay && !hasPendingRequest" :variant="canWrite ? 'outline' : 'primary'" @click="openPaymentModal">
              <template #icon-left><CreditCard class="w-4 h-4" /></template>
              {{ canWrite ? t('billing.banner.renew') : t('billing.banner.subscribe') }}
            </BaseButton>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ canWrite ? t('account.canWrite') : t('account.readOnly') }}</p>
          <div v-if="monthlyFee !== null" class="rounded-2xl border border-slate-100 bg-surface-light p-4 dark:border-slate-800 dark:bg-surface-dark">
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('account.monthlyFee') }}</p>
            <p class="text-lg font-bold text-slate-900 dark:text-white">{{ formatMoney(monthlyFee) }}</p>
            <p class="text-sm text-slate-600 dark:text-slate-300">{{ farmsSummary }}</p>
          </div>
          <div v-if="latestRequest" class="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>{{ t('account.latestRequest', { digits: latestRequest.bkashLast4, date: formatDate(latestRequest.createdAt) }) }}</span>
            <BaseBadge :tone="REQUEST_TONES[latestRequest.status]">{{ t(`billing.requestStatus.${latestRequest.status}`) }}</BaseBadge>
          </div>
        </div>
      </BaseAsyncState>
    </BaseCard>

    <BaseCard>
      <template #header>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('account.profile') }}</h2>
      </template>
      <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
        <BaseInput v-model="values.name" :label="t('auth.fields.name')" :error="errors.name" autocomplete="name" required />
        <BaseInput :model-value="phone" :label="t('auth.fields.phone')" :hint="t('account.phoneHint')" readonly />
        <BaseInput
          v-model="values.email"
          :label="`${t('auth.fields.email')} (${t('common.optional')})`"
          :error="errors.email"
          type="email"
          autocomplete="email"
        />
        <BaseAlert v-if="saveError" variant="error">{{ saveError.message }}</BaseAlert>
        <BaseAlert v-else-if="isSaved" variant="success">{{ t('account.saved') }}</BaseAlert>
        <div class="flex justify-end">
          <BaseButton type="submit" :loading="isSubmitting">{{ t('common.save') }}</BaseButton>
        </div>
      </form>
    </BaseCard>

    <ChangePasswordCard />
  </div>
</template>
