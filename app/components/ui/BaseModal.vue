<script setup lang="ts">
import { X } from '@lucide/vue'

/** Centered dialog; closes on Escape, the close button or a click on the backdrop. */
defineProps<{
  title?: string
}>()

const isOpen = defineModel<boolean>({ required: true })
const { close } = useOverlay(isOpen)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
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
            class="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl bg-white dark:bg-surface-dark-elevated shadow-popover"
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
