<script setup lang="ts">
import { Check, KeyRound, X } from '@lucide/vue'
import { PASSWORD_RESET_STATUSES } from '~/constants/auth'
import type { PasswordResetRequest, PasswordResetStatus } from '~/types/models'

/** Password-reset requests, filtered by status, with approve / reject actions. */
const { t } = useI18n()
const { formatDate } = useLocaleDate()

const statusFilter = useQueryParam<PasswordResetStatus>('resetStatus', PASSWORD_RESET_STATUSES, 'pending')
const tabs = computed(() => PASSWORD_RESET_STATUSES.map((value) => ({ value, label: t(`billing.requestStatus.${value}`) })))

const { items, status, error, isEmpty, currentPage, totalPages, goToPage, refresh, accounts, accountsStatus } =
  useAdminPasswordResets(() => statusFilter.value)

const review = usePasswordResetReview(() => refresh())
const { isOpen: isReviewOpen, issued } = review
const isIssuedOpen = computed({
  get: () => issued.value !== null,
  set: (open) => {
    if (!open) review.dismissIssued()
  },
})

const isPending = computed(() => statusFilter.value === 'pending')
const columns = computed(() => [
  { key: 'account', label: t('admin.requests.user') },
  { key: 'createdAt', label: t('admin.requests.submitted') },
  ...(isPending.value ? [{ key: 'actions', label: t('common.actions') }] : [{ key: 'reviewedAt', label: t('admin.requests.reviewed') }]),
])
const rows = computed(() => items.value.map((request) => ({ ...request, request })))

/** The account's name, "…" while loading, or a note when no account uses the number. */
const accountName = (phone: string) => {
  const account = accounts.value[phone]
  if (account) return account.name
  return accountsStatus.value === 'success' ? t('admin.resets.noAccount') : '…'
}

const dialog = computed(() => {
  const request = review.target.value
  const name = request ? (accounts.value[request.phone]?.name ?? request.phone) : ''
  return review.action.value === 'approve'
    ? {
        title: t('admin.resets.approveTitle'),
        message: t('admin.resets.approveMessage', { name, phone: request?.phone ?? '' }),
        confirmLabel: t('admin.grant.approve'),
        variant: 'primary' as const,
      }
    : {
        title: t('admin.resets.rejectTitle'),
        message: t('admin.resets.rejectMessage', { phone: request?.phone ?? '' }),
        confirmLabel: t('admin.requests.reject'),
        variant: 'danger' as const,
      }
})
</script>

<template>
  <div>
    <div class="mb-5 -mx-4 px-4 overflow-x-auto scrollbar-none">
      <BaseTabs v-model="statusFilter" :tabs="tabs" class="whitespace-nowrap" />
    </div>

    <BaseAsyncState :status="status" :error="error" :is-empty="isEmpty" :empty-title="t('admin.requests.empty')" @retry="refresh">
      <template #empty-icon><KeyRound class="w-7 h-7" /></template>
      <BaseTable :columns="columns" :rows="rows" row-key="phone">
        <template #cell-account="{ row }">
          <p class="font-semibold whitespace-nowrap">{{ accountName(row.phone as string) }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ row.phone }}</p>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="whitespace-nowrap">{{ formatDate(row.createdAt as Date, { dateStyle: 'medium', timeStyle: 'short' }) }}</span>
        </template>
        <template #cell-reviewedAt="{ row }">
          <span class="whitespace-nowrap">{{ formatDate(row.reviewedAt as Date) }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <BaseButton size="sm" @click="review.open(row.request as PasswordResetRequest, 'approve')">
              <template #icon-left><Check class="w-4 h-4" /></template>
              {{ t('admin.grant.approve') }}
            </BaseButton>
            <BaseButton size="sm" variant="outline" @click="review.open(row.request as PasswordResetRequest, 'reject')">
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

    <BaseConfirmDialog
      v-model="isReviewOpen"
      :title="dialog.title"
      :message="dialog.message"
      :confirm-label="dialog.confirmLabel"
      :variant="dialog.variant"
      :loading="review.status.value === 'loading'"
      :error="review.error.value"
      @confirm="review.confirm"
    />

    <BaseModal v-model="isIssuedOpen" :title="t('admin.resets.issuedTitle')">
      <p class="text-sm text-slate-600 dark:text-slate-300">{{ t('admin.resets.issuedMessage', { phone: issued?.phone ?? '' }) }}</p>
      <p class="mt-4 rounded-xl bg-slate-100 dark:bg-surface-dark-elevated px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest text-slate-900 dark:text-white select-all">
        {{ issued?.password }}
      </p>
      <template #footer>
        <BaseButton @click="isIssuedOpen = false">{{ t('admin.resets.issuedDone') }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
