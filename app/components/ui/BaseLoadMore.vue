<script setup lang="ts">
import type { AppError, RequestStatus } from '~/types/network'

/** "Load more" footer for append-mode lists: spinner while loading, inline retry on failure. */
withDefaults(
  defineProps<{
    hasMore: boolean
    status: RequestStatus
    error?: AppError | null
  }>(),
  {
    error: null,
  }
)

defineEmits<{
  loadMore: []
}>()
</script>

<template>
  <div v-if="hasMore || status === 'error'" class="flex flex-col items-center gap-3 pt-4">
    <p v-if="status === 'error'" role="alert" class="text-sm text-red-600 dark:text-red-400">{{ error?.message }}</p>
    <BaseButton variant="outline" :loading="status === 'loading'" @click="$emit('loadMore')">
      {{ status === 'error' ? $t('common.retry') : $t('common.loadMore') }}
    </BaseButton>
  </div>
</template>
