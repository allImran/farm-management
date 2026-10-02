<script setup lang="ts">
import { LayoutDashboard, Radio, ScanEye } from '@lucide/vue'
import { MARKETING_SECTION_IDS } from '~/constants/marketing'

const TECHNOLOGIES = ['thermal', 'tracking', 'platform'] as const
// Relative bar heights for the mini dashboard illustration.
const DASHBOARD_BARS = ['h-1/4', 'h-2/5', 'h-1/3', 'h-3/5', 'h-1/2', 'h-4/5', 'h-2/3']

const { t } = useI18n()
</script>

<template>
  <MarketingSection :id="MARKETING_SECTION_IDS.technology" tone="muted">
    <BaseReveal>
      <MarketingSectionHeading
        :eyebrow="t('technology.eyebrow')"
        :title="t('technology.title')"
        :description="t('technology.description')"
      />
    </BaseReveal>

    <div class="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3 sm:mt-16">
      <BaseReveal
        v-for="(key, index) in TECHNOLOGIES"
        :key="key"
        :delay="index * 120"
        :class="key === 'platform' ? 'md:col-span-2 lg:col-span-1' : ''"
      >
        <TechnologyCard
          :tag="t(`technology.items.${key}.tag`)"
          :title="t(`technology.items.${key}.title`)"
          :description="t(`technology.items.${key}.description`)"
        >
          <template #media>
            <div v-if="key === 'thermal'" class="absolute inset-0 bg-thermal-floor">
              <span class="absolute left-8 top-8 w-1/4 aspect-square rounded-full bg-thermal-body animate-breathe" />
              <span class="absolute right-10 top-4 w-1/5 aspect-square rounded-full bg-thermal-body animate-breathe" style="animation-delay: -1.2s" />
              <span class="absolute left-1/3 bottom-2 w-1/4 aspect-square rounded-full bg-thermal-body-hot animate-breathe" style="animation-delay: -2.4s" />
              <span class="absolute inset-0 flex items-center justify-center">
                <span class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur">
                  <ScanEye class="w-7 h-7" />
                </span>
              </span>
            </div>

            <div v-else-if="key === 'tracking'" class="absolute inset-0 bg-slate-900">
              <div class="absolute inset-0 bg-grid-faint bg-grid" />
              <span class="absolute inset-0 flex items-center justify-center">
                <span class="absolute h-40 w-40 rounded-full border border-accent-green/20 animate-breathe" />
                <span class="absolute h-24 w-24 rounded-full border border-accent-green/40 animate-breathe" style="animation-delay: -1s" />
                <span class="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-green text-slate-900 shadow-popover">
                  <Radio class="w-7 h-7" />
                </span>
              </span>
            </div>

            <div v-else class="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-500 dark:from-primary-700 dark:to-primary-950">
              <div class="absolute inset-x-8 bottom-0 top-10 flex items-end gap-2">
                <span
                  v-for="(height, barIndex) in DASHBOARD_BARS"
                  :key="barIndex"
                  class="flex-1 rounded-t-lg bg-white/60 dark:bg-white/25"
                  :class="height"
                />
              </div>
              <span class="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-primary-400 shadow-popover">
                <LayoutDashboard class="w-6 h-6" />
              </span>
            </div>
          </template>
        </TechnologyCard>
      </BaseReveal>
    </div>
  </MarketingSection>
</template>
