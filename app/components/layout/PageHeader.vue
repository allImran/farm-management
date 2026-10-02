<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { NuxtLink } from '#components'

/** Title row at the top of an app page, with an optional back link and action buttons. */
withDefaults(
  defineProps<{
    title: string
    description?: string
    backTo?: string
    backLabel?: string
  }>(),
  {}
)
</script>

<template>
  <div class="mb-6">
    <NuxtLink
      v-if="backTo"
      :to="backTo"
      class="inline-flex items-center gap-1.5 mb-3 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
    >
      <ArrowLeft class="w-4 h-4" />
      {{ backLabel ?? $t('common.back') }}
    </NuxtLink>
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white break-words">{{ title }}</h1>
          <slot name="badge" />
        </div>
        <p v-if="description" class="mt-1 text-slate-500 dark:text-slate-400">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
