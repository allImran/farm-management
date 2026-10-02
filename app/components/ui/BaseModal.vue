<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { X } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: 'md' | 'lg'
  }>(),
  {
    size: 'md',
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
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition
          appear
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            role="dialog"
            aria-modal="true"
            :aria-label="title"
            class="relative w-full max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl bg-white dark:bg-surface-dark-elevated shadow-popover"
            :class="size === 'lg' ? 'max-w-2xl' : 'max-w-lg'"
          >
            <div class="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                {{ title }}
              </h3>
              <button
                type="button"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                :aria-label="$t('common.close')"
                @click="close"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
            <div class="px-4 sm:px-6 py-5 overflow-y-auto">
              <slot />
            </div>
            <div
              v-if="$slots.footer"
              class="flex flex-wrap items-center justify-end gap-2 px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
