<script setup lang="ts">
import { Plus, Warehouse } from '@lucide/vue'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { t } = useI18n()
const { items, status, error, isEmpty, hasMore, loadMoreStatus, loadMoreError, loadMore, reset } = useFarmList()
const form = useFarmForm(reset)
const { isOpen, values, errors, isExtraFeeOpen, isCheckingFarms } = form
const { plan, farmCount } = storeToRefs(useBillingStore())

useSeoMeta({ title: () => t('farms.title') })
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <PageHeader :title="t('farms.title')" :description="t('farms.description')">
      <template #actions>
        <BaseButton :loading="isCheckingFarms" @click="form.openCreate">
          <template #icon-left><Plus class="w-4 h-4" /></template>
          {{ t('farms.add') }}
        </BaseButton>
      </template>
    </PageHeader>

    <BaseAsyncState
      :status="status"
      :error="error"
      :is-empty="isEmpty"
      :empty-title="t('farms.emptyTitle')"
      :empty-description="t('farms.emptyDescription')"
      @retry="reset"
    >
      <template #empty-icon><Warehouse class="w-7 h-7" /></template>
      <template #empty-action>
        <BaseButton :loading="isCheckingFarms" @click="form.openCreate">{{ t('farms.add') }}</BaseButton>
      </template>
      <ul class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <li v-for="farm in items" :key="farm.id"><FarmCard :farm="farm" /></li>
      </ul>
      <BaseLoadMore :has-more="hasMore" :status="loadMoreStatus" :error="loadMoreError" @load-more="loadMore" />
    </BaseAsyncState>

    <FarmFormModal
      v-model:open="isOpen"
      v-model:values="values"
      :is-editing="false"
      :errors="errors"
      :error="form.error.value"
      :loading="form.isLoading.value"
      @submit="form.handleSubmit"
    />
    <ExtraFarmConsentDialog
      v-if="plan"
      v-model="isExtraFeeOpen"
      :farm-count="farmCount"
      :plan="plan"
      @confirm="form.confirmExtraFee"
    />
  </div>
</template>
