<script setup lang="ts">
import { MARKETING_SECTION_IDS } from '~/constants/marketing'

const STAT_KEYS = ['monitoring', 'alert', 'accuracy', 'platform'] as const

const { t } = useI18n()
</script>

<template>
  <MarketingSection :id="MARKETING_SECTION_IDS.impact" tone="inverted">
    <template #background>
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <div class="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-thermal-600/30 blur-3xl animate-drift" />
        <div class="absolute -top-24 right-0 h-80 w-80 rounded-full bg-thermal-300/15 blur-3xl animate-drift" style="animation-delay: -9s" />
      </div>
    </template>

    <BaseReveal>
      <MarketingSectionHeading :eyebrow="t('impact.eyebrow')" :title="t('impact.title')" is-inverted />
    </BaseReveal>

    <dl class="mt-14 grid grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
      <BaseReveal v-for="(key, index) in STAT_KEYS" :key="key" :delay="index * 100" class="flex flex-col border-t border-white/15 pt-6">
        <dt class="text-sm text-slate-400 sm:text-base">{{ t(`impact.items.${key}.label`) }}</dt>
        <dd
          class="order-first mt-2 bg-gradient-to-r from-thermal-300 to-thermal-50 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl"
        >
          {{ t(`impact.items.${key}.value`) }}
        </dd>
      </BaseReveal>
    </dl>
  </MarketingSection>
</template>
