<script setup lang="ts">
import { Bird, MapPin, Pencil, Plus, Trash2 } from '@lucide/vue'
import { NuxtLink } from '#components'
import { BATCH_STATUSES } from '~/constants/farm'
import { ROUTES } from '~/constants/routes'
import type { BatchStatus } from '~/types/models'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const farmId = computed(() => String(route.params.farmId))

const { data: farm, status, error, execute: reloadFarm } = useFarm(farmId)

// 'all' keeps the filter out of the URL.
const statusFilter = useQueryParam<BatchStatus | 'all'>('status', ['all', ...BATCH_STATUSES], 'all')
const statusTabs = computed(() => [
  { value: 'all', label: t('common.all') },
  ...BATCH_STATUSES.map((value) => ({ value, label: t(`batches.status.${value}`) })),
])
const batches = useBatchList(() => ({
  farmId: farmId.value,
  status: statusFilter.value === 'all' ? null : statusFilter.value,
}))

const farmForm = useFarmForm(reloadFarm)
const batchForm = useBatchForm(() => farmId.value, batches.reset)
const farmDelete = useFarmDelete()
const { isOpen: isFarmFormOpen, values: farmValues, errors: farmErrors } = farmForm
const { isOpen: isBatchFormOpen, values: batchValues, errors: batchErrors } = batchForm
const { isOpen: isDeleteOpen } = farmDelete

const expenseScope = computed(() => ({ farmId: farmId.value, batchId: null }))

useSeoMeta({ title: () => farm.value?.name ?? t('farms.title') })
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <BaseAsyncState
      :status="status"
      :error="error"
      :is-empty="!farm"
      :empty-title="t('farms.notFound')"
      @retry="reloadFarm"
    >
      <template #empty-action>
        <BaseButton :as="NuxtLink" :to="ROUTES.farms" variant="outline">{{ t('farms.backToFarms') }}</BaseButton>
      </template>

      <template v-if="farm">
        <PageHeader :title="farm.name" :back-to="ROUTES.farms" :back-label="t('farms.title')">
          <template #actions>
            <BaseButton variant="outline" @click="farmForm.openEdit(farm)">
              <template #icon-left><Pencil class="w-4 h-4" /></template>
              {{ t('common.edit') }}
            </BaseButton>
            <BaseButton variant="ghost" :aria-label="t('common.delete')" @click="farmDelete.open(farm)">
              <Trash2 class="w-4 h-4 text-red-500" />
            </BaseButton>
          </template>
        </PageHeader>
        <p v-if="farm.location || farm.address" class="-mt-3 mb-6 flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <MapPin class="w-4 h-4 mt-0.5 shrink-0" />
          <span>{{ [farm.location, farm.address].filter(Boolean).join(' · ') }}</span>
        </p>

        <section class="mb-10">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('batches.title') }}</h2>
            <BaseButton @click="batchForm.openCreate">
              <template #icon-left><Plus class="w-4 h-4" /></template>
              {{ t('batches.add') }}
            </BaseButton>
          </div>
          <div class="mb-4 overflow-x-auto scrollbar-none">
            <BaseTabs v-model="statusFilter" :tabs="statusTabs" />
          </div>
          <BaseAsyncState
            :status="batches.status.value"
            :error="batches.error.value"
            :is-empty="batches.isEmpty.value"
            :empty-title="t('batches.emptyTitle')"
            :empty-description="t('batches.emptyDescription')"
            @retry="batches.reset"
          >
            <template #empty-icon><Bird class="w-7 h-7" /></template>
            <ul class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <li v-for="batch in batches.items.value" :key="batch.id"><BatchCard :batch="batch" /></li>
            </ul>
            <BaseLoadMore
              :has-more="batches.hasMore.value"
              :status="batches.loadMoreStatus.value"
              :error="batches.loadMoreError.value"
              @load-more="batches.loadMore"
            />
          </BaseAsyncState>
        </section>

        <RecordSection kind="expenses" :scope="expenseScope" :title="t('farms.farmExpenses')" />
      </template>
    </BaseAsyncState>

    <FarmFormModal
      v-model:open="isFarmFormOpen"
      v-model:values="farmValues"
      :is-editing="true"
      :errors="farmErrors"
      :error="farmForm.error.value"
      :loading="farmForm.status.value === 'loading'"
      @submit="farmForm.handleSubmit"
    />
    <BatchFormModal
      v-model:open="isBatchFormOpen"
      v-model:values="batchValues"
      :is-editing="false"
      :errors="batchErrors"
      :error="batchForm.error.value"
      :loading="batchForm.status.value === 'loading'"
      @submit="batchForm.handleSubmit"
    />
    <BaseConfirmDialog
      v-model="isDeleteOpen"
      :title="t('farms.deleteTitle')"
      :message="t('farms.deleteMessage')"
      :confirm-label="t('common.delete')"
      :loading="farmDelete.isLoading.value"
      :error="farmDelete.error.value"
      @confirm="farmDelete.confirm"
    />
  </div>
</template>
