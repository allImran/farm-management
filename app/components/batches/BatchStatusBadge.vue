<script setup lang="ts">
import type { BatchStatus } from '~/types/models'
import type { Tone } from '~/types/ui'

defineProps<{
  status: BatchStatus
}>()

const TONES: Record<BatchStatus, Tone> = { active: 'green', completed: 'blue', cancelled: 'slate' }
</script>

<template>
  <BaseBadge :tone="TONES[status]">{{ $t(`batches.status.${status}`) }}</BaseBadge>
</template>
