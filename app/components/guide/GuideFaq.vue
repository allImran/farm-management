<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

export type GuideFaqItem = { key: string; question: string; answer: string }

defineProps<{
  id: string
  title: string
  items: GuideFaqItem[]
}>()
</script>

<template>
  <section :id="id" :aria-labelledby="`${id}-title`" class="scroll-mt-24">
    <h2 :id="`${id}-title`" class="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{{ title }}</h2>
    <div class="mt-6 divide-y divide-slate-200/70 overflow-hidden rounded-2xl border border-slate-200/70 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-surface-dark-elevated">
      <!-- Native <details> gives keyboard and screen-reader support for free. -->
      <details v-for="item in items" :key="item.key" class="group">
        <summary
          class="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400 sm:px-5 dark:text-white dark:hover:bg-slate-800/60 [&::-webkit-details-marker]:hidden"
        >
          {{ item.question }}
          <ChevronDown class="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <p class="px-4 pb-4 text-sm leading-relaxed text-slate-600 sm:px-5 dark:text-slate-400">{{ item.answer }}</p>
      </details>
    </div>
  </section>
</template>
