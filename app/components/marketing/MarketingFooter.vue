<script setup lang="ts">
import { APP_NAME } from '~/constants/app'
import { MARKETING_NAV_LINKS } from '~/constants/marketing'

const { t } = useI18n()
const { formatNumber } = useLocaleNumber()
const year = formatNumber(new Date().getFullYear(), { useGrouping: false })
</script>

<template>
  <footer class="border-t border-slate-200/70 bg-white dark:border-slate-800 dark:bg-surface-dark">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-10 md:flex-row md:justify-between">
        <div class="max-w-sm">
          <AppLogo />
          <p class="mt-4 text-slate-600 dark:text-slate-400">{{ t('footer.tagline') }}</p>
        </div>
        <nav :aria-label="t('footer.platform')">
          <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ t('footer.platform') }}</p>
          <ul class="mt-4 grid grid-cols-2 gap-x-10 gap-y-1 sm:grid-cols-3">
            <li v-for="link in MARKETING_NAV_LINKS" :key="link.id">
              <a
                :href="`#${link.id}`"
                class="inline-flex min-h-10 items-center rounded-lg text-sm text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-slate-400 dark:hover:text-white"
              >
                {{ t(link.labelKey) }}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div
        class="mt-10 flex flex-col-reverse gap-4 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
      >
        <p class="text-sm text-slate-500 dark:text-slate-400">© {{ year }} {{ APP_NAME }}. {{ t('footer.rights') }}</p>
        <LanguageSwitcher class="self-start sm:self-auto" />
      </div>
    </div>
  </footer>
</template>
