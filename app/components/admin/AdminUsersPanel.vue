<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { Search, Users } from '@lucide/vue'
import type { UserProfile } from '~/types/models'

/** All accounts with their access status; "Manage" opens the grant modal. */
const { t } = useI18n()
const { formatDate } = useLocaleDate()

const search = ref('')
const debouncedSearch = refDebounced(search, 300)
const users = useAdminUsers(() => debouncedSearch.value)
const { items, status, error, isEmpty, currentPage, totalPages, goToPage, refresh, subscriptions, subscriptionsError } = users

const grant = useSubscriptionGrant((target) => users.refreshSubscription(target.userId))

const columns = computed(() => [
  { key: 'name', label: t('admin.users.name') },
  { key: 'email', label: t('auth.fields.email') },
  { key: 'createdAt', label: t('admin.users.joined') },
  { key: 'subscription', label: t('admin.users.access') },
  { key: 'actions', label: t('common.actions') },
])

const manage = (user: UserProfile) => grant.open({ userId: user.id, userName: user.name, userPhone: user.phone, request: null })
</script>

<template>
  <div>
    <div class="mb-5 max-w-sm">
      <BaseInput v-model="search" type="search" inputmode="tel" :placeholder="t('admin.users.search')" :aria-label="t('admin.users.search')">
        <template #icon-left><Search class="w-4 h-4" /></template>
      </BaseInput>
    </div>

    <BaseAlert v-if="subscriptionsError" variant="warning" class="mb-4">{{ subscriptionsError.message }}</BaseAlert>
    <BaseAsyncState :status="status" :error="error" :is-empty="isEmpty" :empty-title="t('admin.users.empty')" @retry="refresh">
      <template #empty-icon><Users class="w-7 h-7" /></template>
      <BaseTable :columns="columns" :rows="items as unknown as Record<string, unknown>[]" row-key="id">
        <template #cell-name="{ row }">
          <p class="font-semibold whitespace-nowrap">{{ row.name }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ row.phone }}</p>
        </template>
        <template #cell-email="{ row }">{{ row.email || '—' }}</template>
        <template #cell-createdAt="{ row }">
          <span class="whitespace-nowrap">{{ formatDate(row.createdAt as Date) }}</span>
        </template>
        <template #cell-subscription="{ row }">
          <SubscriptionBadge :subscription="subscriptions[row.id as string] ?? null" />
        </template>
        <template #cell-actions="{ row }">
          <BaseButton size="sm" variant="outline" @click="manage(row as unknown as UserProfile)">{{ t('admin.users.manage') }}</BaseButton>
        </template>
      </BaseTable>
      <div v-if="totalPages > 1" class="mt-4 flex justify-center">
        <BasePagination :current-page="currentPage" :total-pages="totalPages" @update:current-page="goToPage" />
      </div>
    </BaseAsyncState>

    <SubscriptionGrantModal :grant="grant" />
  </div>
</template>
