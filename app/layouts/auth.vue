<script setup lang="ts">
import { NuxtLink } from '#components'
import { ROUTES } from '~/constants/routes'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark">
    <header class="flex items-center justify-between gap-2 h-16 px-4 sm:px-6">
      <NuxtLink
        :to="ROUTES.home"
        :aria-label="t('common.home')"
        class="rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300"
      >
        <AppLogo />
      </NuxtLink>
      <div class="flex items-center gap-1 sm:gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
    <main class="flex-1 flex items-start sm:items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </main>
  </div>
</template>
