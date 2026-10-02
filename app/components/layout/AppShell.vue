<script setup lang="ts">
import { useSidebar } from '~/composables/useSidebar'

const { collapsed, mobileOpen, closeMobile } = useSidebar()
</script>

<template>
  <div class="min-h-screen bg-surface-light dark:bg-surface-dark">
    <AppSidebar />

    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
        aria-hidden="true"
        @click="closeMobile"
      />
    </Transition>

    <div
      class="flex flex-col min-h-screen min-w-0 max-w-full transition-all duration-300 ease-in-out"
      :class="collapsed ? 'lg:pl-20' : 'lg:pl-64'"
    >
      <AppHeader />

      <main class="flex-1 min-w-0 max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
