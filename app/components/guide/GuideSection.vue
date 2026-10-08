<script setup lang="ts">
import type { Component } from 'vue'

export type GuideStep = { key: string; title: string; body: string }

withDefaults(
  defineProps<{
    id: string
    icon: Component
    title: string
    intro: string
    steps: GuideStep[]
    tip?: string
    tipTitle?: string
  }>(),
  { tip: undefined, tipTitle: undefined }
)

const { formatNumber } = useLocaleNumber()
</script>

<template>
  <section :id="id" :aria-labelledby="`${id}-title`" class="scroll-mt-24">
    <div class="flex items-center gap-3">
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-primary-400 shadow-card dark:bg-white dark:text-slate-900">
        <component :is="icon" class="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 :id="`${id}-title`" class="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{{ title }}</h2>
    </div>
    <p class="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{{ intro }}</p>

    <ol class="mt-6 grid gap-3 sm:grid-cols-2">
      <li
        v-for="(step, index) in steps"
        :key="step.key"
        class="flex gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-surface-dark-elevated"
      >
        <span
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-slate-900"
          aria-hidden="true"
        >
          {{ formatNumber(index + 1) }}
        </span>
        <div class="min-w-0">
          <h3 class="font-semibold text-slate-900 dark:text-white">{{ step.title }}</h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{{ step.body }}</p>
        </div>
      </li>
    </ol>

    <BaseAlert v-if="tip" variant="warning" :title="tipTitle" class="mt-4">{{ tip }}</BaseAlert>
  </section>
</template>
