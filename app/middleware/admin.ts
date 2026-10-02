import { ROUTES } from '~/constants/routes'

/** Admin pages; run after `auth`. Hides the page from non-admins, the rules block the data. */
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  const authStore = useAuthStore()
  await authStore.whenReady()

  if (!authStore.isAdmin) return navigateTo(ROUTES.dashboard)
})
