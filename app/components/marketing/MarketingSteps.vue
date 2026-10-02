<script setup lang="ts">
import { BellRing, BrainCircuit, Cable } from '@lucide/vue'
import { MARKETING_SECTION_IDS } from '~/constants/marketing'

const STEPS = [
  { key: 'connect', icon: Cable },
  { key: 'analyze', icon: BrainCircuit },
  { key: 'act', icon: BellRing },
] as const

const { t } = useI18n()
const { formatNumber } = useLocaleNumber()
</script>

<template>
  <MarketingSection :id="MARKETING_SECTION_IDS.howItWorks">
    <BaseReveal>
      <MarketingSectionHeading :eyebrow="t('steps.eyebrow')" :title="t('steps.title')" />
    </BaseReveal>

    <ol class="relative mt-14 grid gap-6 sm:mt-16 md:grid-cols-3">
      <!-- Connector line between the step badges on wide screens. -->
      <span
        class="absolute left-[16.66%] right-[16.66%] top-12 hidden h-px bg-gradient-to-r from-thermal-500 via-thermal-300 to-primary-400 md:block"
        aria-hidden="true"
      />
      <BaseReveal v-for="(step, index) in STEPS" :key="step.key" as="li" :delay="index * 120" class="relative">
        <div class="h-full rounded-3xl border border-slate-200/70 bg-white p-6 text-center sm:p-8 dark:border-slate-800 dark:bg-surface-dark-elevated">
          <span
            class="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-primary-400 shadow-card dark:bg-white dark:text-slate-900"
          >
            <component :is="step.icon" class="w-6 h-6" aria-hidden="true" />
            <span
              class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-slate-900"
            >
              {{ formatNumber(index + 1) }}
            </span>
          </span>
          <h3 class="mt-6 text-xl font-bold text-slate-900 dark:text-white">{{ t(`steps.items.${step.key}.title`) }}</h3>
          <p class="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">{{ t(`steps.items.${step.key}.description`) }}</p>
        </div>
      </BaseReveal>
    </ol>
  </MarketingSection>
</template>
