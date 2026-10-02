<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    description?: string
    align?: 'center' | 'left'
    /** Light text for use on the `inverted` section tone. */
    isInverted?: boolean
  }>(),
  {
    description: undefined,
    align: 'center',
    isInverted: false,
  }
)
</script>

<template>
  <div :class="align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-xl'">
    <p
      class="inline-flex items-center gap-2 text-sm font-semibold"
      :class="isInverted ? 'text-thermal-200' : 'text-thermal-500 dark:text-thermal-300'"
    >
      <span class="w-2 h-2 rounded-full bg-gradient-to-r from-thermal-500 to-thermal-200" aria-hidden="true" />
      {{ eyebrow }}
    </p>
    <h2
      class="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
      :class="isInverted ? 'text-white' : 'text-slate-900 dark:text-white'"
    >
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="mt-5 text-base sm:text-lg leading-relaxed"
      :class="isInverted ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'"
    >
      {{ description }}
    </p>
  </div>
</template>
