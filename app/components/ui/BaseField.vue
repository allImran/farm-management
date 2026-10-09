<script setup lang="ts">
/**
 * Label, error and hint around one form control; the frame of `BaseInput`, `BaseSelect` and
 * `BaseTextarea`. The slot receives the control's `id`, its `describedBy` id and the shared
 * `controlClass` (border turns red on error).
 */
const props = defineProps<{
  label?: string
  error?: string
  /** Helper text under the field; hidden while an error is shown. */
  hint?: string
  /** Appends "(optional)" to the label. */
  optional?: boolean
}>()

const { t } = useI18n()
const id = useId()
const messageId = `${id}-message`

const fullLabel = computed(() => (props.optional ? `${props.label} (${t('common.optional')})` : props.label))
const describedBy = computed(() => (props.error || props.hint ? messageId : undefined))
const controlClass = computed(() => [
  'w-full rounded-xl border bg-white dark:bg-surface-dark-elevated text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-soft px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-4 focus:ring-primary-300/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed',
  props.error
    ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200/50 focus:border-red-400'
    : 'border-slate-200 dark:border-slate-700',
])
</script>

<template>
  <div>
    <label v-if="label" :for="id" class="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
      {{ fullLabel }}
    </label>
    <slot :id="id" :described-by="describedBy" :control-class="controlClass" />
    <p v-if="error" :id="messageId" class="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">{{ error }}</p>
    <p v-else-if="hint" :id="messageId" class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{{ hint }}</p>
  </div>
</template>
