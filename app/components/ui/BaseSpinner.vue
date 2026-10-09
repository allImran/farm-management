<script setup lang="ts">
import { Loader2 } from '@lucide/vue'

type Size = 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    size?: Size
  }>(),
  {
    size: 'md',
  }
)

const sizeClasses: Record<Size, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-9 h-9',
}
</script>

<template>
  <Loader2 class="animate-spin" :class="sizeClasses[size]" />
</template>
