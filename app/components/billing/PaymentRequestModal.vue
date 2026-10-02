<script setup lang="ts">
import { Clock3, Smartphone } from '@lucide/vue'
import { BKASH_DIGITS_LENGTH } from '~/constants/billing'

/** Explains how to pay via bKash and collects the last digits of the payer's number. */
const { t } = useI18n()
const { formatMoney } = useLocaleNumber()
const { formatDate } = useLocaleDate()
const { isPaymentModalOpen } = useWriteAccess()
const {
  last4,
  fieldError,
  plan,
  latestRequest,
  hasPendingRequest,
  loadStatus,
  loadError,
  submitStatus,
  submitError,
  reload,
  handleSubmit,
} = usePaymentRequestForm()

const wasRejected = computed(() => latestRequest.value?.status === 'rejected')
</script>

<template>
  <BaseModal v-model="isPaymentModalOpen" :title="t('billing.request.title')">
    <BaseAsyncState :status="loadStatus" :error="loadError" @retry="reload">
      <div v-if="hasPendingRequest && latestRequest" class="flex gap-3">
        <span class="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
          <Clock3 class="w-5 h-5" />
        </span>
        <div class="text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <p class="font-semibold text-slate-900 dark:text-white">{{ t('billing.request.pendingTitle') }}</p>
          <p>
            {{
              t('billing.request.pendingBody', {
                digits: latestRequest.bkashLast4,
                date: formatDate(latestRequest.createdAt),
              })
            }}
          </p>
        </div>
      </div>

      <form v-else id="payment-request-form" class="space-y-5" novalidate @submit.prevent="handleSubmit">
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('billing.request.intro') }}</p>

        <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-surface-light dark:bg-surface-dark p-4 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('billing.request.price') }}</span>
            <span class="text-lg font-bold text-slate-900 dark:text-white">
              {{ plan?.monthlyPrice ? t('billing.request.perMonth', { price: formatMoney(plan.monthlyPrice) }) : '—' }}
            </span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('billing.request.sendTo') }}</span>
            <span class="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
              <Smartphone class="w-4 h-4 text-primary-600" />
              {{ plan?.bkashNumber || '—' }}
            </span>
          </div>
          <p v-if="plan?.instructions" class="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{{ plan.instructions }}</p>
        </div>

        <BaseAlert v-if="wasRejected" variant="warning" :title="t('billing.request.rejectedTitle')">
          {{ latestRequest?.reviewNote || t('billing.request.rejectedBody') }}
        </BaseAlert>

        <BaseInput
          v-model="last4"
          :label="t('billing.request.digitsLabel', { count: BKASH_DIGITS_LENGTH })"
          :hint="t('billing.request.digitsHint')"
          :error="fieldError"
          inputmode="numeric"
          autocomplete="off"
          :maxlength="BKASH_DIGITS_LENGTH"
          placeholder="1234"
          required
        />
        <BaseAlert v-if="submitError" variant="error">{{ submitError.message }}</BaseAlert>
      </form>
    </BaseAsyncState>

    <template #footer>
      <BaseButton variant="ghost" @click="isPaymentModalOpen = false">{{ t('common.close') }}</BaseButton>
      <BaseButton
        v-if="loadStatus === 'success' && !hasPendingRequest"
        type="submit"
        form="payment-request-form"
        :loading="submitStatus === 'loading'"
      >
        {{ t('billing.request.submit') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
