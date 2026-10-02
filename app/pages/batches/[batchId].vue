<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'
import { NuxtLink } from '#components'
import { BATCH_RECORD_KINDS } from '~/constants/records'
import { ROUTES } from '~/constants/routes'
import type { RecordKind } from '~/types/records'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()
const { formatDate } = useLocaleDate()
const { formatNumber } = useLocaleNumber()
const route = useRoute()
const batchId = computed(() => String(route.params.batchId))

const { data: batch, status, error, execute: reloadBatch } = useBatch(batchId)
const { stats, status: statsStatus, error: statsError, refresh: refreshStats } = useBatchStats(() => batch.value)

const activeKind = useQueryParam<RecordKind>('tab', BATCH_RECORD_KINDS, BATCH_RECORD_KINDS[0]!)
const tabs = computed(() => BATCH_RECORD_KINDS.map((kind) => ({ value: kind, label: t(`records.${kind}.title`) })))
const scope = computed(() => ({ farmId: batch.value?.farmId ?? '', batchId: batchId.value }))

const handleBatchSaved = async () => {
  await reloadBatch()
  refreshStats()
}
const batchForm = useBatchForm(() => batch.value?.farmId ?? '', handleBatchSaved)
const batchDelete = useBatchDelete()
const { isOpen: isFormOpen, values, errors } = batchForm
const { isOpen: isDeleteOpen } = batchDelete

useSeoMeta({ title: () => batch.value?.name ?? t('batches.title') })
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <BaseAsyncState :status="status" :error="error" :is-empty="!batch" :empty-title="t('batches.notFound')" @retry="reloadBatch">
      <template #empty-action>
        <BaseButton :as="NuxtLink" :to="ROUTES.farms" variant="outline">{{ t('farms.backToFarms') }}</BaseButton>
      </template>

      <template v-if="batch">
        <PageHeader
          :title="batch.name"
          :description="[batch.breed, t('batches.startedOn', { date: formatDate(batch.startDate) }), t('batches.placed', { count: formatNumber(batch.initialQuantity) })].filter(Boolean).join(' · ')"
          :back-to="ROUTES.farm(batch.farmId)"
          :back-label="t('batches.backToFarm')"
        >
          <template #badge><BatchStatusBadge :status="batch.status" /></template>
          <template #actions>
            <BaseButton variant="outline" @click="batchForm.openEdit(batch)">
              <template #icon-left><Pencil class="w-4 h-4" /></template>
              {{ t('common.edit') }}
            </BaseButton>
            <BaseButton variant="ghost" :aria-label="t('common.delete')" @click="batchDelete.open(batch)">
              <Trash2 class="w-4 h-4 text-red-500" />
            </BaseButton>
          </template>
        </PageHeader>
        <p v-if="batch.note" class="-mt-3 mb-6 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{{ batch.note }}</p>

        <div class="mb-8">
          <BaseAsyncState :status="statsStatus" :error="statsError" @retry="refreshStats">
            <template #loading>
              <div class="grid grid-cols-1 min-[400px]:grid-cols-2 xl:grid-cols-4 gap-4">
                <BaseSkeleton v-for="i in 8" :key="i" variant="rect" height="6rem" />
              </div>
            </template>
            <BatchStatsGrid v-if="stats" :stats="stats" />
          </BaseAsyncState>
        </div>

        <div class="mb-5 -mx-4 px-4 overflow-x-auto scrollbar-none">
          <BaseTabs v-model="activeKind" :tabs="tabs" class="whitespace-nowrap" />
        </div>
        <RecordSection :key="activeKind" :kind="activeKind" :scope="scope" @changed="refreshStats" />
      </template>
    </BaseAsyncState>

    <BatchFormModal
      v-model:open="isFormOpen"
      v-model:values="values"
      :is-editing="true"
      :errors="errors"
      :error="batchForm.error.value"
      :loading="batchForm.status.value === 'loading'"
      @submit="batchForm.handleSubmit"
    />
    <BaseConfirmDialog
      v-model="isDeleteOpen"
      :title="t('batches.deleteTitle')"
      :message="t('batches.deleteMessage')"
      :confirm-label="t('common.delete')"
      :loading="batchDelete.isLoading.value"
      :error="batchDelete.error.value"
      @confirm="batchDelete.confirm"
    />
  </div>
</template>
