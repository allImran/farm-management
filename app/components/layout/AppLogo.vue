<script setup lang="ts">
import { Feather } from '@lucide/vue'
import { APP_NAME } from '~/constants/app'
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <span class="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-500 text-slate-900 shrink-0 shadow-soft">
      <Feather class="w-5 h-5" aria-hidden="true" />
    </span>
    <span class="font-bold text-lg text-slate-900 dark:text-white whitespace-nowrap">{{ APP_NAME }}</span>
  </span>
</template>
