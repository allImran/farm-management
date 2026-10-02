<script setup lang="ts">
import { Menu, ChevronDown, UserRound, LogOut } from '@lucide/vue'
import { onClickOutside } from '@vueuse/core'
import { NuxtLink } from '#components'
import { ROUTES } from '~/constants/routes'

const { t } = useI18n()
const { toggleMobile } = useSidebar()
const authStore = useAuthStore()
const { profile, isAdmin } = storeToRefs(authStore)

const userName = computed(() => profile.value?.name ?? '')
const roleLabel = computed(() => (isAdmin.value ? t('app.header.admin') : profile.value?.phone ?? ''))

const isMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
onClickOutside(menuRef, () => {
  isMenuOpen.value = false
})

const handleLogout = async () => {
  isMenuOpen.value = false
  await authStore.signOut()
  await navigateTo(ROUTES.login)
}
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between gap-2 h-16 px-4 sm:px-6 bg-white dark:bg-surface-dark-elevated border-b border-slate-100 dark:border-slate-800"
  >
    <button
      type="button"
      class="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
      :aria-label="t('common.openMenu')"
      @click="toggleMobile"
    >
      <Menu class="w-5 h-5" />
    </button>
    <div class="flex-1" />

    <div class="flex items-center gap-1 sm:gap-3 shrink-0">
      <LanguageSwitcher />
      <ThemeToggle />

      <div ref="menuRef" class="relative">
        <button
          type="button"
          class="flex items-center gap-2.5 pl-1.5 pr-1.5 sm:pr-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300"
          :aria-label="t('app.header.userMenu')"
          :aria-expanded="isMenuOpen"
          @click="isMenuOpen = !isMenuOpen"
        >
          <BaseAvatar :name="userName" size="sm" />
          <span class="hidden sm:flex flex-col items-start leading-tight">
            <span class="text-sm font-semibold text-slate-900 dark:text-white max-w-[10rem] truncate">{{ userName }}</span>
            <span class="text-xs text-slate-400">{{ roleLabel }}</span>
          </span>
          <ChevronDown
            class="hidden sm:block w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="isMenuOpen ? 'rotate-180' : ''"
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
            v-if="isMenuOpen"
            class="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-surface-dark-elevated border border-slate-100 dark:border-slate-800 shadow-popover p-1.5 origin-top-right"
          >
            <NuxtLink
              :to="ROUTES.account"
              class="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              @click="isMenuOpen = false"
            >
              <UserRound class="w-4 h-4" />
              {{ t('app.nav.account') }}
            </NuxtLink>
            <div class="my-1.5 h-px bg-slate-100 dark:bg-slate-800" />
            <button
              type="button"
              class="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-accent-red hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              @click="handleLogout"
            >
              <LogOut class="w-4 h-4" />
              {{ t('app.header.logout') }}
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
