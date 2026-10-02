<script setup lang="ts">
import { SUPPORTED_LOCALES, type AppLocale } from '~/constants/i18n'

// Short labels keep the control compact; each is written in its own script on purpose.
const SHORT_LABELS: Record<AppLocale, string> = { bn: 'বাং', en: 'EN' }

const { locale, switchLocale } = useAppLocale()
const { t } = useI18n()
</script>

<template>
  <div
    role="group"
    :aria-label="t('common.changeLanguage')"
    class="inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700"
  >
    <button
      v-for="code in SUPPORTED_LOCALES"
      :key="code"
      type="button"
      :lang="code"
      :aria-pressed="locale === code"
      class="min-w-10 h-8 px-3 rounded-full text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
      :class="
        locale === code
          ? 'bg-white text-slate-900 shadow-soft dark:bg-surface-dark-elevated dark:text-white'
          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
      "
      @click="switchLocale(code)"
    >
      {{ SHORT_LABELS[code] }}
    </button>
  </div>
</template>
