<script setup lang="ts">
import type { ToggleItem } from '~/types/finance'

/**
 * Checkbox list for the profit & loss "what if" toggles. Ticked = included in the result;
 * the model holds the keys that are left out.
 */
const props = defineProps<{
  items: ToggleItem[]
  /** Accessible name of the group. */
  label: string
}>()

const excluded = defineModel<string[]>('excluded', { required: true })

const { t } = useI18n()

const isIncluded = (key: string) => !excluded.value.includes(key)

const handleToggle = (key: string, isChecked: boolean) => {
  excluded.value = isChecked ? excluded.value.filter((item) => item !== key) : [...excluded.value, key]
}

const selectAll = () => {
  excluded.value = []
}
const selectNone = () => {
  excluded.value = props.items.map((item) => item.key)
}
</script>

<template>
  <div>
    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1" role="group" :aria-label="label">
      <li v-for="item in items" :key="item.key" class="flex min-h-10 items-center justify-between gap-3">
        <BaseCheckbox :model-value="isIncluded(item.key)" class="min-w-0 py-2" @update:model-value="handleToggle(item.key, $event)">
          <span class="flex min-w-0 items-center gap-2">
            <span v-if="item.color" class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: item.color }" aria-hidden="true" />
            <span class="truncate" :class="isIncluded(item.key) ? '' : 'text-slate-400 line-through dark:text-slate-500'">{{ item.label }}</span>
          </span>
        </BaseCheckbox>
        <span
          class="shrink-0 text-sm font-semibold tabular-nums"
          :class="[
            item.isNegative ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100',
            isIncluded(item.key) ? '' : 'opacity-50',
          ]"
        >
          {{ item.value }}
        </span>
      </li>
    </ul>
    <div class="mt-3 flex flex-wrap gap-2">
      <BaseButton variant="ghost" :disabled="excluded.length === 0" @click="selectAll">{{ t('reports.selectAll') }}</BaseButton>
      <BaseButton variant="ghost" :disabled="excluded.length === items.length" @click="selectNone">{{ t('reports.selectNone') }}</BaseButton>
    </div>
  </div>
</template>
