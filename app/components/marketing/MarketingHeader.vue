<script setup lang="ts">
import { Menu } from '@lucide/vue'
import { useWindowScroll } from '@vueuse/core'
import { NuxtLink } from '#components'
import { ROUTES } from '~/constants/routes'

const { t } = useI18n()
const { y } = useWindowScroll()
const { items: navItems } = useMarketingNav()

// The header floats transparently over the hero and gains a surface once content scrolls under it.
const isScrolled = computed(() => y.value > 12)
const isMenuOpen = ref(false)

const handleNavigate = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300"
    :class="
      isScrolled
        ? 'bg-white/80 border-slate-200/70 backdrop-blur-xl dark:bg-surface-dark/80 dark:border-slate-800'
        : 'bg-transparent border-transparent'
    "
  >
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
      <NuxtLink
        :to="ROUTES.home"
        :aria-label="t('common.home')"
        class="rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300"
      >
        <AppLogo />
      </NuxtLink>

      <nav :aria-label="t('nav.primary')" class="hidden lg:flex items-center gap-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="item.to"
          class="rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-1 sm:gap-2">
        <LanguageSwitcher />
        <ThemeToggle class="hidden sm:flex" />
        <BaseButton :as="NuxtLink" :to="ROUTES.login" class="hidden sm:inline-flex">
          {{ t('nav.login') }}
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="icon"
          class="lg:hidden"
          :aria-label="t('common.openMenu')"
          :aria-expanded="isMenuOpen"
          @click="isMenuOpen = true"
        >
          <Menu class="w-5 h-5" />
        </BaseButton>
      </div>
    </div>

    <BaseDrawer v-model="isMenuOpen" :title="t('common.menu')">
      <nav :aria-label="t('nav.primary')" class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="item.to"
          class="rounded-xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          @click="handleNavigate"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <BaseButton :as="NuxtLink" :to="ROUTES.login" size="lg" class="mt-6 w-full" @click="handleNavigate">
        {{ t('nav.login') }}
      </BaseButton>
    </BaseDrawer>
  </header>
</template>
