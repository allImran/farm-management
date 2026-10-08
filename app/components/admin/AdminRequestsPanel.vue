<script setup lang="ts">
import { Check, Inbox, X } from '@lucide/vue'
import { PAYMENT_REQUEST_STATUSES } from '~/constants/billing'
import type { PaymentRequest, PaymentRequestStatus } from '~/types/models'
import { monthlyFee } from '~/utils/subscription'

/** bKash payment requests, filtered by status, with approve / reject actions. */
const { t } = useI18n()
const { formatDate } = useLocaleDate()

const statusFilter = useQueryParam<PaymentRequestStatus>('status', PAYMENT_REQUEST_STATUSES, 'pending')
const tabs = computed(() => PAYMENT_REQUEST_STATUSES.map((value) => ({ value, label: t(`billing.requestStatus.${value}`) })))

const list = useAdminPaymentRequests(() => statusFilter.value)
const { items, status, error, isEmpty, currentPage, totalPages, goToPage, refresh, farmCounts } = list
const { plan } = storeToRefs(useBillingStore())
const { formatMoney, formatNumber } = useLocaleNumber()

/** "3 farms · ৳400 / month", or empty while the count is loading. */
const expectedFor = (userId: string) => {
  const farmCount = farmCounts.value[userId]
  if (farmCount === undefined || !plan.value) return ''
  return t('admin.requests.expected', {
    farms: formatNumber(farmCount),
    fee: formatMoney(monthlyFee(plan.value, farmCount)),
  })
}

const grant = useSubscriptionGrant(() => refresh())
const reject = useRejectRequest(() => refresh())
const { isOpen: isRejectOpen, note: rejectNote } = reject

const isPending = computed(() => statusFilter.value === 'pending')
const columns = computed(() => [
  { key: 'user', label: t('admin.requests.user') },
  { key: 'bkashLast4', label: t('admin.requests.digits') },
  // Today's farm count only says what a payment should cover while it is being reviewed.
  ...(isPending.value ? [{ key: 'farms', label: t('admin.requests.farms') }] : []),
  { key: 'createdAt', label: t('admin.requests.submitted') },
  ...(isPending.value ? [{ key: 'actions', label: t('common.actions') }] : [{ key: 'reviewedAt', label: t('admin.requests.reviewed') }]),
])
const rows = computed(() => items.value.map((request) => ({ ...request, request })))

const approve = (request: PaymentRequest) =>
  grant.open({ userId: request.userId, userName: request.userName, userPhone: request.userPhone, request })
</script>

<template>
  <div>
    <div class="mb-5 -mx-4 px-4 overflow-x-auto scrollbar-none">
      <BaseTabs v-model="statusFilter" :tabs="tabs" class="whitespace-nowrap" />
    </div>

    <BaseAsyncState :status="status" :error="error" :is-empty="isEmpty" :empty-title="t('admin.requests.empty')" @retry="refresh">
      <template #empty-icon><Inbox class="w-7 h-7" /></template>
      <BaseTable :columns="columns" :rows="rows" row-key="id">
        <template #cell-user="{ row }">
          <p class="font-semibold whitespace-nowrap">{{ row.userName }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ row.userPhone }}</p>
        </template>
        <template #cell-bkashLast4="{ row }">
          <span class="font-mono font-semibold tracking-widest">{{ row.bkashLast4 }}</span>
        </template>
        <template #cell-farms="{ row }">
          <span class="whitespace-nowrap">{{ expectedFor(row.userId as string) || '…' }}</span>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="whitespace-nowrap">{{ formatDate(row.createdAt as Date, { dateStyle: 'medium', timeStyle: 'short' }) }}</span>
        </template>
        <template #cell-reviewedAt="{ row }">
          <span class="whitespace-nowrap">{{ formatDate(row.reviewedAt as Date) }}</span>
          <p v-if="row.reviewNote" class="text-xs text-slate-500 dark:text-slate-400">{{ row.reviewNote }}</p>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <BaseButton size="sm" @click="approve(row.request as PaymentRequest)">
              <template #icon-left><Check class="w-4 h-4" /></template>
              {{ t('admin.grant.approve') }}
            </BaseButton>
            <BaseButton size="sm" variant="outline" @click="reject.open(row.request as PaymentRequest)">
              <template #icon-left><X class="w-4 h-4" /></template>
              {{ t('admin.requests.reject') }}
            </BaseButton>
          </div>
        </template>
      </BaseTable>
      <div v-if="totalPages > 1" class="mt-4 flex justify-center">
        <BasePagination :current-page="currentPage" :total-pages="totalPages" @update:current-page="goToPage" />
      </div>
    </BaseAsyncState>

    <SubscriptionGrantModal :grant="grant" />
    <BaseConfirmDialog
      v-model="isRejectOpen"
      :title="t('admin.requests.rejectTitle')"
      :message="t('admin.requests.rejectMessage', { name: reject.target.value?.userName ?? '' })"
      :confirm-label="t('admin.requests.reject')"
      :loading="reject.status.value === 'loading'"
      :error="reject.error.value"
      @confirm="reject.confirm"
    >
      <BaseInput v-model="rejectNote" class="mt-4" :label="`${t('admin.requests.rejectNote')} (${t('common.optional')})`" :maxlength="200" />
    </BaseConfirmDialog>
  </div>
</template>
