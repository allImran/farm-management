<script setup lang="ts">
import type { Component } from 'vue'
import {
  LayoutDashboard,
  Warehouse,
  Contact,
  UserRound,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight,
} from '@lucide/vue'
import { NuxtLink } from '#components'
import { ROUTES } from '~/constants/routes'

type NavLink = {
  labelKey: string
  to: string
  icon: Component
  /** Other path prefixes that count as this section (batches live under farms). */
  matches?: string[]
}

const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useSidebar()
const route = useRoute()
const { t } = useI18n()
const { isAdmin } = storeToRefs(useAuthStore())

const navLinks = computed<NavLink[]>(() => [
  { labelKey: 'app.nav.dashboard', to: ROUTES.dashboard, icon: LayoutDashboard },
  { labelKey: 'app.nav.farms', to: ROUTES.farms, icon: Warehouse, matches: ['/batches'] },
  { labelKey: 'app.nav.contacts', to: ROUTES.contacts, icon: Contact },
  { labelKey: 'app.nav.account', to: ROUTES.account, icon: UserRound },
  ...(isAdmin.value ? [{ labelKey: 'app.nav.admin', to: ROUTES.admin, icon: ShieldCheck }] : []),
])

const isActive = (link: NavLink) => [link.to, ...(link.matches ?? [])].some((prefix) => route.path.startsWith(prefix))
</script>

<template>
  <aside
    :aria-label="t('app.nav.label')"
    class="fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-surface-dark-elevated border-r border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out"
    :class="[
      collapsed ? 'lg:w-20' : 'lg:w-64',
      'w-64',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <div
      class="flex items-center h-16 shrink-0 border-b border-slate-100 dark:border-slate-800"
      :class="collapsed ? 'lg:justify-center px-5 lg:px-2' : 'px-5'"
    >
      <NuxtLink
        :to="ROUTES.dashboard"
        class="rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300 overflow-hidden"
        @click="closeMobile"
      >
        <AppLogo :compact="collapsed" />
      </NuxtLink>
    </div>

    <nav class="flex-1 flex flex-col gap-1.5 px-3 py-5 overflow-y-auto overflow-x-hidden">
      <NavItem
        v-for="link in navLinks"
        :key="link.to"
        :icon="link.icon"
        :label="t(link.labelKey)"
        :to="link.to"
        :active="isActive(link)"
        :collapsed="collapsed"
        @click="closeMobile"
      />
    </nav>

    <div class="hidden lg:block shrink-0 border-t border-slate-100 dark:border-slate-800 p-3">
      <button
        type="button"
        class="flex items-center w-full rounded-xl px-3.5 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200"
        :class="collapsed ? 'justify-center' : 'gap-3'"
        :aria-label="collapsed ? t('app.nav.expand') : t('app.nav.collapse')"
        @click="toggleCollapsed"
      >
        <ChevronsRight v-if="collapsed" class="w-5 h-5 shrink-0" />
        <ChevronsLeft v-else class="w-5 h-5 shrink-0" />
        <span
          class="font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-200"
          :class="collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
        >
          {{ t('app.nav.collapse') }}
        </span>
      </button>
    </div>
  </aside>
</template>
