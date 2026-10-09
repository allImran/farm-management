<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

/** Inline text link in the brand colour, for links inside running text and form footers. */
defineProps<{
  to: RouteLocationRaw
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="rounded font-semibold text-primary-700 dark:text-primary-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
  >
    <slot />
  </NuxtLink>
</template>
