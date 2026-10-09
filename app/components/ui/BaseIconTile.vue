<script setup lang="ts">
import type { Component } from 'vue'
import { TONE_CLASSES } from '~/constants/ui'
import type { Tone } from '~/types/ui'

/** Rounded, tinted square holding an icon (stat cards, farm cards, notices). */
withDefaults(
  defineProps<{
    icon: Component
    tone?: Tone
  }>(),
  {
    tone: 'slate',
  }
)
</script>

<template>
  <span class="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl" :class="TONE_CLASSES[tone]">
    <component :is="icon" class="w-5 h-5" aria-hidden="true" />
  </span>
</template>
