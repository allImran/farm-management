<script setup lang="ts">
import type { BatchStatus } from '~/types/models'

defineProps<{
  status: BatchStatus
}>()

const TONES = { active: 'green', completed: 'blue', cancelled: 'slate' } as const satisfies Record<BatchStatus, string>
</script>

<template>
  <BaseBadge :tone="TONES[status]">{{ $t(`batches.status.${status}`) }}</BaseBadge>
</template>
