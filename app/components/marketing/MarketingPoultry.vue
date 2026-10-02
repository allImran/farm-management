<script setup lang="ts">
import { MARKETING_SECTION_IDS } from '~/constants/marketing'

const POINT_KEYS = ['perBird', 'heatStress', 'alerts'] as const

const { t } = useI18n()
const points = computed(() => POINT_KEYS.map((key) => t(`poultry.points.${key}`)))
</script>

<template>
  <MarketingFeature
    :id="MARKETING_SECTION_IDS.poultry"
    :eyebrow="t('poultry.eyebrow')"
    :title="t('poultry.title')"
    :description="t('poultry.description')"
    :points="points"
  >
    <template #visual>
      <TemperatureAnomalyVisual />
    </template>
  </MarketingFeature>
</template>
