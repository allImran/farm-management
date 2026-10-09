<script setup lang="ts">
import { Bird, MapPin, Plus } from '@lucide/vue'
import { NuxtLink } from '#components'
import { BATCH_STATUSES } from '~/constants/farm'
import { ROUTES } from '~/constants/routes'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const farmId = computed(() => String(route.params.farmId))

const { data: farm, status, error, execute: reloadFarm } = useFarm(farmId)

const {
  active: statusFilter,
  tabs: statusTabs,
  selected: selectedStatus,
} = useQueryFilter('status', BATCH_STATUSES, (value) => t(`batches.status.${value}`))
const batches = useBatchList(() => ({ farmId: farmId.value, status: selectedStatus.value }))

// Every batch (not just the visible page) for the profit & loss batch picker.
const allBatches = useAllFarmBatches(() => farmId.value)
const batchOptions = computed(() => (allBatches.data.value ?? []).map((batch) => ({ id: batch.id, name: batch.name })))
const financeScope = computed(() => ({ farmId: farmId.value }))
const profitSection = useTemplateRef<{ reload: () => Promise<void> }>('profitSection')
const reloadProfit = () => profitSection.value?.reload()

const handleBatchCreated = () => {
  batches.reset()
  allBatches.execute()
}

const farmForm = useFarmForm(reloadFarm)
const batchForm = useBatchForm(() => farmId.value, handleBatchCreated)
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
          <template #menu>
            <BaseEditDeleteActions
              menu
              trigger-variant="overlay"
              @edit="farmForm.openEdit(farm)"
              @delete="farmDelete.open(farm)"
            />
          </template>
          <template #meta>
            <p v-if="farm.address" class="flex items-start gap-1.5">
              <MapPin class="w-4 h-4 mt-0.5 shrink-0" />
              <span class="whitespace-pre-line">{{ farm.address }}</span>
            </p>
            <BaseButton v-else variant="overlay" size="sm" class="-ml-0.5" @click="farmForm.openEdit(farm)">
              <template #icon-left><MapPin class="w-3.5 h-3.5" /></template>
              {{ t('farms.addAddress') }}
            </BaseButton>
          </template>
        </PageHeader>

        <PageSection first>
          <section>
            <SectionHeader :title="t('batches.title')">
              <template #actions>
                <BaseButton size="sm" @click="batchForm.openCreate">
                  <template #icon-left><Plus class="w-4 h-4" /></template>
                  {{ t('batches.add') }}
                </BaseButton>
              </template>
            </SectionHeader>
            <BaseTabs v-model="statusFilter" :tabs="statusTabs" class="mb-4" />
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
        </PageSection>

        <PageSection tone="raised">
          <BaseAsyncState :status="allBatches.status.value" :error="allBatches.error.value" @retry="allBatches.execute()">
            <template #loading><StatCardsSkeleton /></template>
            <ProfitLossSection
              ref="profitSection"
              :scope="financeScope"
              :description="t('reports.farmDescription')"
              :batches="batchOptions"
            />
          </BaseAsyncState>
        </PageSection>

        <PageSection last>
          <RecordSection
            kind="expenses"
            :scope="expenseScope"
            :title="t('farms.farmExpenses')"
            :description="t('farms.expenseHint')"
            @changed="reloadProfit"
          />
        </PageSection>
      </template>
    </BaseAsyncState>

    <FarmFormModal
      v-model:open="isFarmFormOpen"
      v-model:values="farmValues"
      :is-editing="true"
      :errors="farmErrors"
      :error="farmForm.error.value"
      :loading="farmForm.isLoading.value"
      @submit="farmForm.handleSubmit"
    />
    <BatchFormModal
      v-model:open="isBatchFormOpen"
      v-model:values="batchValues"
      :is-editing="false"
      :errors="batchErrors"
      :error="batchForm.error.value"
      :loading="batchForm.isLoading.value"
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
