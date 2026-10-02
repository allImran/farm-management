<script setup lang="ts">
import {
  LayoutDashboard,
  Bird,
  Syringe,
  Wheat,
  ShoppingCart,
  BarChart3,
  MapPin,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Feather,
} from '@lucide/vue'
import { useSidebar } from '~/composables/useSidebar'
import { useRoute } from '#app'
import { ROUTES } from '~/constants/routes'

type NavLink = {
  label: string
  to: string
  icon: typeof LayoutDashboard
}

const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useSidebar()
const route = useRoute()

const navLinks: NavLink[] = [
  { label: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Flocks', to: '/flocks', icon: Bird },
  { label: 'Health & Vaccination', to: '/health', icon: Syringe },
  { label: 'Feed Management', to: '/feed', icon: Wheat },
  { label: 'Sales & Orders', to: '/sales', icon: ShoppingCart },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Venue Management', to: '/venues', icon: MapPin },
  { label: 'Settings', to: '/settings', icon: Settings },
]

const isActive = (to: string) => route.path.startsWith(to)

const onNavClick = () => {
  closeMobile()
}
</script>

<template>
  <aside
    role="navigation"
    aria-label="Main sidebar"
    class="fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-surface-dark-elevated border-r border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out"
    :class="[
      collapsed ? 'w-20' : 'w-64',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <div
      class="flex items-center h-16 shrink-0 border-b border-slate-100 dark:border-slate-800"
      :class="collapsed ? 'justify-center px-2' : 'justify-start gap-2.5 px-5'"
    >
      <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-500 text-slate-900 shrink-0 shadow-soft">
        <Feather class="w-5 h-5" />
      </div>
      <span
        class="font-bold text-lg text-slate-900 dark:text-white whitespace-nowrap overflow-hidden transition-all duration-200"
        :class="collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
      >
        BroilerHQ
      </span>
    </div>

    <nav class="flex-1 flex flex-col gap-1.5 px-3 py-5 overflow-y-auto overflow-x-hidden">
      <NavItem
        v-for="link in navLinks"
        :key="link.to"
        :icon="link.icon"
        :label="link.label"
        :to="link.to"
        :active="isActive(link.to)"
        :collapsed="collapsed"
        @click="onNavClick"
      />
    </nav>

    <div class="shrink-0 border-t border-slate-100 dark:border-slate-800 p-3">
      <button
        type="button"
        class="flex items-center w-full rounded-xl px-3.5 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200"
        :class="collapsed ? 'justify-center' : 'gap-3'"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="toggleCollapsed"
      >
        <ChevronsRight v-if="collapsed" class="w-5 h-5 shrink-0" />
        <ChevronsLeft v-else class="w-5 h-5 shrink-0" />
        <span
          class="font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-200"
          :class="collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
        >
          Collapse
        </span>
      </button>
    </div>
  </aside>
</template>
