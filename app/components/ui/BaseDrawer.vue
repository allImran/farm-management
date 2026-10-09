<script setup lang="ts">
import { X } from '@lucide/vue'

/** Panel that slides in from the right edge (the marketing site's mobile menu). */
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
        class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition
          appear
          enter-active-class="transition-transform duration-250 ease-out"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-200 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div
            role="dialog"
            aria-modal="true"
            :aria-label="title"
            class="absolute top-0 bottom-0 right-0 w-full max-w-md bg-white dark:bg-surface-dark-elevated shadow-popover flex flex-col"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
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
            <div class="flex-1 overflow-y-auto px-6 py-5">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
