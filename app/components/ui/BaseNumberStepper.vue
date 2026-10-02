<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue'

/** Integer input with − / + buttons, clamped to [min, max]. */
const props = withDefaults(
  defineProps<{
    label?: string
    min?: number
    max?: number
    /** Text after the number, e.g. "months". */
    suffix?: string
  }>(),
  {
    min: 1,
    max: 100,
  }
)

const value = defineModel<number>({ required: true })

const clamp = (next: number) => Math.min(props.max, Math.max(props.min, Math.round(next)))
const step = (delta: number) => {
  value.value = clamp(value.value + delta)
}
const handleInput = (event: Event) => {
  const next = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(next)) value.value = clamp(next)
}
</script>

<template>
  <div>
    <span v-if="label" class="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">{{ label }}</span>
    <div class="inline-flex items-center gap-2">
      <BaseButton variant="outline" size="icon" :disabled="value <= min" :aria-label="$t('common.decrease')" @click="step(-1)">
        <Minus class="w-4 h-4" />
      </BaseButton>
      <input
        type="number"
        inputmode="numeric"
        :min="min"
        :max="max"
        :value="value"
        :aria-label="label"
        class="w-16 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark-elevated text-center text-base font-semibold text-slate-900 dark:text-slate-100 py-2 focus:outline-none focus:ring-4 focus:ring-primary-300/50 focus:border-primary-500"
        @change="handleInput"
      />
      <BaseButton variant="outline" size="icon" :disabled="value >= max" :aria-label="$t('common.increase')" @click="step(1)">
        <Plus class="w-4 h-4" />
      </BaseButton>
      <span v-if="suffix" class="text-sm text-slate-600 dark:text-slate-300">{{ suffix }}</span>
    </div>
  </div>
</template>
