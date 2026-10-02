<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from '@lucide/vue'
import { useSidebar } from '~/composables/useSidebar'
import { useTheme } from '~/composables/useTheme'

withDefaults(
  defineProps<{
    userName?: string
    userRole?: string
    hasNotifications?: boolean
  }>(),
  {
    userName: 'Alia Marsh',
    userRole: 'Farm Manager',
    hasNotifications: true,
  }
)

const emit = defineEmits<{
  logout: []
}>()

const { toggleMobile } = useSidebar()
const { isDark, toggle: toggleTheme } = useTheme()

const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeUserMenu = () => {
  userMenuOpen.value = false
}

const onLogout = () => {
  closeUserMenu()
  emit('logout')
}

const onClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    closeUserMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-surface-dark-elevated border-b border-slate-100 dark:border-slate-800"
  >
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <button
        type="button"
        class="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        aria-label="Open sidebar"
        @click="toggleMobile"
      >
        <Menu class="w-5 h-5" />
      </button>

      <label class="relative hidden sm:flex items-center w-full max-w-sm">
        <Search class="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search flocks, orders, reports..."
          class="w-full rounded-full bg-surface-light dark:bg-surface-dark border border-transparent pl-10 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900/40 focus:border-primary-300 transition-all"
        />
      </label>
    </div>

    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <button
        type="button"
        class="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle theme"
        @click="toggleTheme"
      >
        <ClientOnly>
          <Moon v-if="!isDark" class="w-5 h-5" />
          <Sun v-else class="w-5 h-5" />
          <template #fallback>
            <Moon class="w-5 h-5" />
          </template>
        </ClientOnly>
      </button>

      <button
        type="button"
        class="relative flex items-center justify-center w-10 h-10 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell class="w-5 h-5" />
        <span
          v-if="hasNotifications"
          class="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-accent-red ring-2 ring-white dark:ring-surface-dark-elevated"
        />
      </button>

      <div ref="userMenuRef" class="relative">
        <button
          type="button"
          class="flex items-center gap-2.5 pl-1.5 pr-2.5 sm:pr-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          :aria-label="`Open user menu for ${userName}`"
          :aria-expanded="userMenuOpen"
          @click="toggleUserMenu"
        >
          <span
            class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-slate-900 text-xs font-bold shrink-0"
          >
            {{ initials(userName) }}
          </span>
          <span class="hidden sm:flex flex-col items-start leading-tight">
            <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ userName }}</span>
            <span class="text-xs text-slate-400">{{ userRole }}</span>
          </span>
          <ChevronDown
            class="hidden sm:block w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="userMenuOpen ? 'rotate-180' : ''"
          />
        </button>

        <Transition
          enter-active-class="transition ease-out duration-150"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="userMenuOpen"
            class="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-surface-dark-elevated border border-slate-100 dark:border-slate-800 shadow-popover p-1.5 origin-top-right"
          >
            <button
              type="button"
              class="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              @click="closeUserMenu"
            >
              <User class="w-4 h-4" />
              Profile
            </button>
            <button
              type="button"
              class="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              @click="closeUserMenu"
            >
              <Settings class="w-4 h-4" />
              Settings
            </button>
            <div class="my-1.5 h-px bg-slate-100 dark:bg-slate-800" />
            <button
              type="button"
              class="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-accent-red hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              @click="onLogout"
            >
              <LogOut class="w-4 h-4" />
              Log out
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
