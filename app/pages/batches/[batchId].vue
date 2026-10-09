<script setup lang="ts">
import { NuxtLink } from '#components'
import { BATCH_RECORD_KINDS, BATCH_VIEWS } from '~/constants/records'
import { ROUTES } from '~/constants/routes'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()
const { formatDate } = useLocaleDate()
const { formatNumber } = useLocaleNumber()
const route = useRoute()
const batchId = computed(() => String(route.params.batchId))

const { data: batch, status, error, execute: reloadBatch } = useBatch(batchId)
const { stats, status: statsStatus, error: statsError, refresh: refreshStats } = useBatchStats(() => batch.value)

const { active: activeView, tabs: viewTabs } = useQueryTabs('view', BATCH_VIEWS, (view) => t(`batches.views.${view}`))
const { active: activeKind, tabs: kindTabs } = useQueryTabs('tab', BATCH_RECORD_KINDS, (kind) => t(`records.${kind}.title`))
const scope = computed(() => ({ farmId: batch.value?.farmId ?? '', batchId: batchId.value }))
const financeScope = computed(() => (batch.value ? { farmId: batch.value.farmId, batchId: batch.value.id } : undefined))

const handleBatchSaved = async () => {
  await reloadBatch()
  refreshStats()
}
const batchForm = useBatchForm(() => batch.value?.farmId ?? '', handleBatchSaved)
const batchDelete = useBatchDelete()
const { isOpen: isFormOpen, values, errors } = batchForm
const { isOpen: isDeleteOpen } = batchDelete

// e.g. "Cobb 500 · Started 3 Oct 2026 · 1,000 chicks placed"
const summary = computed(() =>
  batch.value
    ? [
        batch.value.breed,
        t('batches.startedOn', { date: formatDate(batch.value.startDate) }),
        t('batches.placed', { count: formatNumber(batch.value.initialQuantity) }),
      ]
        .filter(Boolean)
        .join(' · ')
    : '',
)

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
          :description="summary"
          :back-to="ROUTES.farm(batch.farmId)"
          :back-label="t('batches.backToFarm')"
        >
          <template #badge><BatchStatusBadge :status="batch.status" /></template>
          <template #menu>
            <BaseEditDeleteActions
              trigger-variant="overlay"
              @edit="batchForm.openEdit(batch)"
              @delete="batchDelete.open(batch)"
            />
          </template>
          <template v-if="batch.note" #meta>
            <p class="whitespace-pre-line">{{ batch.note }}</p>
          </template>
        </PageHeader>

        <PageSection first>
          <BaseAsyncState :status="statsStatus" :error="statsError" @retry="refreshStats">
            <template #loading>
              <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                <BaseSkeleton v-for="i in 8" :key="i" />
              </div>
            </template>
            <BatchStatsGrid v-if="stats" :stats="stats" />
          </BaseAsyncState>
        </PageSection>

        <PageSection tone="raised" last>
          <BaseTabs v-model="activeView" :tabs="viewTabs" class="mb-6" />

          <BaseTabPanel :active="`${activeView}:${activeKind}`">
            <template v-if="activeView === 'records'">
              <BaseTabs v-model="activeKind" :tabs="kindTabs" class="mb-5" />
              <RecordSection :key="activeKind" :kind="activeKind" :scope="scope" @changed="refreshStats" />
            </template>
            <BatchChartsSection v-else-if="activeView === 'charts'" :batch="batch" />
            <ProfitLossSection v-else :scope="financeScope" :description="t('reports.batchDescription')" />
          </BaseTabPanel>
        </PageSection>
      </template>
    </BaseAsyncState>

    <BatchFormModal
      v-model:open="isFormOpen"
      v-model:values="values"
      :is-editing="true"
      :errors="errors"
      :error="batchForm.error.value"
      :loading="batchForm.isLoading.value"
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
