import { ROUTES } from '~/constants/routes'

/** Login/sign-up pages: signed-in users with a profile go straight to the dashboard. */
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  const authStore = useAuthStore()
  await authStore.whenReady()

  if (authStore.isSignedIn && !authStore.needsProfile) return navigateTo(ROUTES.dashboard)
})
