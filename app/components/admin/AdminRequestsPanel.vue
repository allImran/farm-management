<script setup lang="ts">
import { Inbox } from '@lucide/vue'
import { PAYMENT_REQUEST_STATUSES } from '~/constants/billing'
import type { PaymentRequest } from '~/types/models'
import { monthlyFee } from '~/utils/subscription'

/** bKash payment requests, filtered by status, with approve / reject actions. */
const { t } = useI18n()
const { formatDate } = useLocaleDate()

const { active: statusFilter, tabs } = useQueryTabs('status', PAYMENT_REQUEST_STATUSES, (value) => t(`billing.requestStatus.${value}`))

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

const approve = (request: PaymentRequest) =>
  grant.open({ userId: request.userId, userName: request.userName, userPhone: request.userPhone, request })
</script>

<template>
  <div>
    <BaseTabs v-model="statusFilter" :tabs="tabs" class="mb-5" />

    <BaseAsyncState :status="status" :error="error" :is-empty="isEmpty" :empty-title="t('admin.requests.empty')" @retry="refresh">
      <template #empty-icon><Inbox class="w-7 h-7" /></template>
      <BaseTable :columns="columns" :rows="items" row-key="id">
        <template #cell-user="{ row }"><AdminPersonCell :name="row.userName" :phone="row.userPhone" /></template>
        <template #cell-bkashLast4="{ row }">
          <span class="font-mono font-semibold tracking-widest">{{ row.bkashLast4 }}</span>
        </template>
        <template #cell-farms="{ row }">
          <span class="whitespace-nowrap">{{ expectedFor(row.userId) || '…' }}</span>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="whitespace-nowrap">{{ formatDate(row.createdAt, { dateStyle: 'medium', timeStyle: 'short' }) }}</span>
        </template>
        <template #cell-reviewedAt="{ row }">
          <span class="whitespace-nowrap">{{ formatDate(row.reviewedAt) }}</span>
          <p v-if="row.reviewNote" class="text-xs text-slate-500 dark:text-slate-400">{{ row.reviewNote }}</p>
        </template>
        <template #cell-actions="{ row }">
          <AdminReviewActions @approve="approve(row)" @reject="reject.open(row)" />
        </template>
      </BaseTable>
      <BasePagination :current-page="currentPage" :total-pages="totalPages" @update:current-page="goToPage" />
    </BaseAsyncState>

    <SubscriptionGrantModal :grant="grant" />
    <BaseConfirmDialog
      v-model="isRejectOpen"
      :title="t('admin.requests.rejectTitle')"
      :message="t('admin.requests.rejectMessage', { name: reject.target.value?.userName ?? '' })"
      :confirm-label="t('admin.requests.reject')"
      :loading="reject.isLoading.value"
      :error="reject.error.value"
      @confirm="reject.confirm"
    >
      <BaseInput v-model="rejectNote" class="mt-4" :label="t('admin.requests.rejectNote')" optional :maxlength="200" />
    </BaseConfirmDialog>
  </div>
</template>
