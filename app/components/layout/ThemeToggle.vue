<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

const { isDark, toggle } = useTheme()
const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300 transition-colors"
    :aria-label="t('common.toggleTheme')"
    @click="toggle"
  >
    <ClientOnly>
      <Moon v-if="!isDark" class="w-5 h-5" />
      <Sun v-else class="w-5 h-5" />
      <template #fallback>
        <Moon class="w-5 h-5" />
      </template>
    </ClientOnly>
  </button>
</template>
