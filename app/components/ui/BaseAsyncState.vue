<script setup lang="ts">
import type { AppError, RequestStatus } from '~/types/network'

/** Renders the four data states (loading / error / empty / content) the same way everywhere. */
withDefaults(
  defineProps<{
    status: RequestStatus
    error?: AppError | null
    isEmpty?: boolean
    emptyTitle?: string
    emptyDescription?: string
  }>(),
  {
    error: null,
    isEmpty: false,
  }
)

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div v-if="status === 'idle' || status === 'loading'" aria-busy="true">
    <slot name="loading">
      <div class="space-y-3">
        <BaseSkeleton v-for="i in 3" :key="i" variant="rect" height="4.5rem" />
      </div>
    </slot>
  </div>
  <BaseAlert v-else-if="status === 'error'" variant="error">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <span>{{ error?.message }}</span>
      <BaseButton size="sm" variant="outline" @click="$emit('retry')">{{ $t('common.retry') }}</BaseButton>
    </div>
  </BaseAlert>
  <BaseEmptyState v-else-if="isEmpty" :title="emptyTitle ?? $t('common.noData')" :description="emptyDescription">
    <template v-if="$slots['empty-icon']" #icon><slot name="empty-icon" /></template>
    <template v-if="$slots['empty-action']" #action><slot name="empty-action" /></template>
  </BaseEmptyState>
  <slot v-else />
</template>
