<script setup lang="ts">
import { APP_NAME } from '~/constants/app'

withDefaults(
  defineProps<{
    /** Icon only on large screens (collapsed sidebar); the name still shows on mobile. */
    compact?: boolean
  }>(),
  { compact: false }
)
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <span class="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-500 text-slate-900 shrink-0 shadow-soft">
      <!-- Barn with an X-braced door: the "X" of FarmXYZ. Same mark as public/favicon.svg. -->
      <svg
        class="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
        <path d="M8 21v-8h8v8" />
        <path d="m8 13 8 8M16 13l-8 8" />
      </svg>
    </span>
    <span class="font-bold text-lg text-slate-900 dark:text-white whitespace-nowrap" :class="compact ? 'lg:sr-only' : ''">
      <!-- Two-tone wordmark is visual only; screen readers get the plain name. -->
      <span aria-hidden="true">Farm<span class="text-primary-700 dark:text-primary-400">XYZ</span></span>
      <span class="sr-only">{{ APP_NAME }}</span>
    </span>
  </span>
</template>
