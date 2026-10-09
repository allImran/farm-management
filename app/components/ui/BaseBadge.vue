<script setup lang="ts">
import { TONE_CLASSES } from '~/constants/ui'
import type { Tone } from '~/types/ui'

withDefaults(
  defineProps<{
    tone?: Tone
    size?: 'sm' | 'md'
  }>(),
  {
    tone: 'slate',
    size: 'md',
  }
)
</script>

<template>
  <span
    class="inline-flex items-center font-semibold rounded-full"
    :class="[TONE_CLASSES[tone], size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-0.5' : 'text-xs px-2.5 py-1 gap-1']"
  >
    <slot />
  </span>
</template>
