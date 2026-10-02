<script setup lang="ts">
import { MARKETING_SECTION_IDS } from '~/constants/marketing'

const POINT_KEYS = ['geofence', 'signals', 'history'] as const

const { t } = useI18n()
const points = computed(() => POINT_KEYS.map((key) => t(`cattle.points.${key}`)))
</script>

<template>
  <MarketingFeature
    :id="MARKETING_SECTION_IDS.cattle"
    :eyebrow="t('cattle.eyebrow')"
    :title="t('cattle.title')"
    :description="t('cattle.description')"
    :points="points"
    tone="muted"
    is-reversed
  >
    <template #visual>
      <GeoTrackingVisual />
    </template>
  </MarketingFeature>
</template>
