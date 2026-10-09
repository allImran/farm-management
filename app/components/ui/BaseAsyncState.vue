<script setup lang="ts">
import type { AppError, RequestStatus } from '~/types/network'

/** Renders the four data states (loading / error / empty / content) the same way everywhere. */
const props = withDefaults(
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

type View = 'loading' | 'error' | 'empty' | 'content'
type SettledView = Extract<View, 'empty' | 'content'>

const isPending = computed(() => props.status === 'idle' || props.status === 'loading')

/**
 * The last content/empty view shown. Reloads (a filter tab, a refresh after an edit) keep it on
 * screen, dimmed, instead of swapping to the skeleton and back, which made the view flicker. The
 * skeleton is only for the first load, or a retry after an error.
 */
const settledView = ref<SettledView | null>(null)

watchEffect(() => {
  if (props.status === 'error') settledView.value = null
  else if (props.status === 'success') settledView.value = props.isEmpty ? 'empty' : 'content'
})

const isRefreshing = computed(() => isPending.value && settledView.value !== null)

const view = computed<View>(() => {
  if (isPending.value) return settledView.value ?? 'loading'
  if (props.status === 'error') return 'error'
  return props.isEmpty ? 'empty' : 'content'
})
</script>

<template>
  <!-- Keyed by view so a new view (skeleton → content, error → content) remounts and fades in; the
       skeleton itself appears at once, since fading it in from blank reads as a flash. -->
  <div
    :key="view"
    class="transition-opacity duration-200"
    :class="[
      view === 'loading' ? '' : 'animate-fade-in motion-reduce:animate-none',
      isRefreshing ? 'opacity-60 pointer-events-none' : '',
    ]"
    :aria-busy="isPending || undefined"
  >
    <slot v-if="view === 'loading'" name="loading">
      <div class="space-y-3">
        <BaseSkeleton v-for="i in 3" :key="i" height="4.5rem" />
      </div>
    </slot>
    <BaseAlert v-else-if="view === 'error'" variant="error">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span>{{ error?.message }}</span>
        <BaseButton size="sm" variant="outline" @click="$emit('retry')">{{ $t('common.retry') }}</BaseButton>
      </div>
    </BaseAlert>
    <BaseEmptyState v-else-if="view === 'empty'" :title="emptyTitle ?? $t('common.noData')" :description="emptyDescription">
      <template v-if="$slots['empty-icon']" #icon><slot name="empty-icon" /></template>
      <template v-if="$slots['empty-action']" #action><slot name="empty-action" /></template>
    </BaseEmptyState>
    <slot v-else />
  </div>
</template>
