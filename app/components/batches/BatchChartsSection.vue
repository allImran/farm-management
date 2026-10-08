<script setup lang="ts">
import type { Batch } from '~/types/models'

/** Batch charts with their loading / error states; loads when shown, so it is always current. */
const props = defineProps<{
  batch: Batch
}>()

const { t } = useI18n()
const { series, hasWeights, hasDeaths, hasFeed, status, error, refresh } = useBatchSeries(() => props.batch)
</script>

<template>
  <section>
    <h2 class="sr-only">{{ t('charts.title') }}</h2>
    <BaseAsyncState :status="status" :error="error" @retry="refresh">
      <template #loading>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BaseSkeleton variant="rect" height="18rem" class="lg:col-span-2" />
          <BaseSkeleton v-for="i in 2" :key="i" variant="rect" height="18rem" />
        </div>
      </template>
      <BatchCharts v-if="series" :series="series" :has-weights="hasWeights" :has-deaths="hasDeaths" :has-feed="hasFeed" />
    </BaseAsyncState>
  </section>
</template>
