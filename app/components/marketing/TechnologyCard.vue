<script setup lang="ts">
defineProps<{
  tag: string
  title: string
  description: string
}>()
</script>

<template>
  <article
    class="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:border-slate-800 dark:bg-surface-dark-elevated"
  >
    <div class="relative aspect-video overflow-hidden" aria-hidden="true">
      <div class="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
        <slot name="media" />
      </div>
    </div>
    <div class="flex flex-1 flex-col p-6 sm:p-7">
      <p class="text-sm font-semibold text-thermal-500 dark:text-thermal-300">{{ tag }}</p>
      <h3 class="mt-2 text-xl font-bold leading-snug text-slate-900 dark:text-white">{{ title }}</h3>
      <p class="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">{{ description }}</p>
    </div>
  </article>
</template>
