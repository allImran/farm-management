<script setup lang="ts">
/** Name over phone number, for the first column of the admin tables. */
defineProps<{
  name: string
  phone: string
}>()
</script>

<template>
  <p class="font-semibold whitespace-nowrap">{{ name }}</p>
  <p class="text-xs text-slate-500 dark:text-slate-400">{{ phone }}</p>
</template>
