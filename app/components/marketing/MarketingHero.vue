<script setup lang="ts">
import { ArrowRight, Sparkles } from '@lucide/vue'
import { NuxtLink } from '#components'
import { MARKETING_SECTION_IDS } from '~/constants/marketing'
import { ROUTES } from '~/constants/routes'

const { t } = useI18n()
</script>

<template>
  <section class="relative overflow-hidden bg-white pt-28 pb-16 sm:pt-36 sm:pb-24 dark:bg-surface-dark">
    <!-- Slow, blurred "heat" orbs give the hero a living, generative feel without imagery. -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-thermal-300/30 blur-3xl animate-drift dark:bg-thermal-500/25" />
      <div
        class="absolute top-10 -right-20 h-96 w-96 rounded-full bg-primary-300/40 blur-3xl animate-drift dark:bg-thermal-700/50"
        style="animation-delay: -6s"
      />
      <div
        class="absolute top-72 left-1/3 h-72 w-72 rounded-full bg-accent-purple/20 blur-3xl animate-drift dark:bg-accent-purple/25"
        style="animation-delay: -12s"
      />
    </div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl text-center animate-slide-up">
        <p
          class="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-1.5 text-sm font-semibold text-slate-700 backdrop-blur dark:border-slate-700 dark:bg-surface-dark-elevated/70 dark:text-slate-200"
        >
          <Sparkles class="w-4 h-4 text-thermal-400" aria-hidden="true" />
          {{ t('hero.eyebrow') }}
        </p>

        <h1 class="mt-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
          {{ t('hero.titleLead') }}
          <span
            class="bg-gradient-to-r from-thermal-700 via-thermal-500 to-thermal-400 bg-clip-text text-transparent dark:from-thermal-400 dark:via-thermal-300 dark:to-thermal-50"
          >
            {{ t('hero.titleHighlight') }}
          </span>
        </h1>

        <p class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
          {{ t('hero.subtitle') }}
        </p>

        <div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <BaseButton :as="NuxtLink" :to="ROUTES.signup" size="lg">
            {{ t('hero.primaryCta') }}
            <template #icon-right>
              <ArrowRight class="w-5 h-5" aria-hidden="true" />
            </template>
          </BaseButton>
          <BaseButton as="a" :href="`#${MARKETING_SECTION_IDS.technology}`" variant="outline" size="lg">
            {{ t('hero.secondaryCta') }}
          </BaseButton>
        </div>
      </div>

      <div class="mx-auto mt-14 max-w-6xl animate-slide-up sm:mt-20">
        <ThermalScanVisual />
      </div>
    </div>
  </section>
</template>
