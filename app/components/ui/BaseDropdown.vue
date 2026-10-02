<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

type Item = { label: string; value: string; disabled?: boolean }

withDefaults(
  defineProps<{
    items?: Item[]
  }>(),
  {
    items: () => [],
  }
)

const emit = defineEmits<{
  select: [value: string]
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

onClickOutside(rootRef, () => {
  open.value = false
})

function toggle() {
  open.value = !open.value
}

function selectItem(item: Item) {
  if (item.disabled) return
  emit('select', item.value)
  open.value = false
}

defineExpose({ close: () => (open.value = false) })
</script>

<template>
  <div ref="rootRef" class="relative inline-block">
    <div @click="toggle">
      <slot :open="open" />
    </div>
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute left-0 z-40 mt-2 min-w-[10rem] rounded-xl bg-white dark:bg-surface-dark-elevated shadow-popover border border-slate-100 dark:border-slate-800 py-1.5"
      >
        <slot name="menu">
          <button
            v-for="item in items"
            :key="item.value"
            type="button"
            class="w-full text-left px-3.5 py-2 text-sm text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="item.disabled"
            @click="selectItem(item)"
          >
            {{ item.label }}
          </button>
        </slot>
      </div>
    </Transition>
  </div>
</template>
