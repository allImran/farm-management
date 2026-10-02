<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { X } from '@lucide/vue'

type Side = 'left' | 'right'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    side?: Side
  }>(),
  {
    side: 'right',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKeydown)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeydown)
    }
  }
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition
          appear
          :enter-active-class="'transition-transform duration-250 ease-out'"
          :enter-from-class="side === 'right' ? 'translate-x-full' : '-translate-x-full'"
          enter-to-class="translate-x-0"
          :leave-active-class="'transition-transform duration-200 ease-in'"
          leave-from-class="translate-x-0"
          :leave-to-class="side === 'right' ? 'translate-x-full' : '-translate-x-full'"
        >
          <div
            class="absolute top-0 bottom-0 w-full max-w-md bg-white dark:bg-surface-dark-elevated shadow-popover flex flex-col"
            :class="side === 'right' ? 'right-0' : 'left-0'"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                {{ title }}
              </h3>
              <button
                type="button"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                @click="close"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-6 py-5">
              <slot />
            </div>
            <div
              v-if="$slots.footer"
              class="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
