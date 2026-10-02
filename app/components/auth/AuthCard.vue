<script setup lang="ts">
/** Card frame shared by the login and sign-up pages. */
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <BaseCard class="!p-6 sm:!p-8">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ title }}</h1>
    <p v-if="subtitle" class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{{ subtitle }}</p>
    <div class="mt-6">
      <slot />
    </div>
    <div v-if="$slots.footer" class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-600 dark:text-slate-300">
      <slot name="footer" />
    </div>
  </BaseCard>
</template>
