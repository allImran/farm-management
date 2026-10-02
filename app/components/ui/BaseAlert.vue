<script setup lang="ts">
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from '@lucide/vue'

type Variant = 'info' | 'success' | 'warning' | 'error'

withDefaults(
  defineProps<{
    variant?: Variant
    title?: string
    dismissible?: boolean
  }>(),
  {
    variant: 'info',
    dismissible: false,
  }
)

defineEmits<{
  dismiss: []
}>()

const iconMap: Record<Variant, unknown> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

const variantClasses: Record<Variant, string> = {
  info: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-300',
  success:
    'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-300',
  warning:
    'bg-primary-50 dark:bg-primary-500/10 border-primary-100 dark:border-primary-500/20 text-primary-800 dark:text-primary-300',
  error: 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-300',
}

const iconColorClasses: Record<Variant, string> = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-primary-600',
  error: 'text-red-500',
}
</script>

<template>
  <div
    class="flex gap-3 rounded-2xl border p-4"
    :class="variantClasses[variant]"
  >
    <component :is="iconMap[variant]" class="w-5 h-5 flex-shrink-0 mt-0.5" :class="iconColorClasses[variant]" />
    <div class="flex-1 min-w-0">
      <p v-if="title" class="text-sm font-semibold mb-0.5">{{ title }}</p>
      <div class="text-sm opacity-90">
        <slot />
      </div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      @click="$emit('dismiss')"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>
