import { ROUTES } from '~/constants/routes'

/**
 * Signed-in pages: sends guests to login (remembering where they were going) and users on a
 * temporary password to the account page. UX only; rules enforce access.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const authStore = useAuthStore()
  await authStore.whenReady()

  if (!authStore.isSignedIn) return navigateTo({ path: ROUTES.login, query: { redirect: to.fullPath } })
  if (authStore.needsProfile) return navigateTo(ROUTES.signup)
  // After an admin reset the user is on a known temporary password; keep them on the account
  // page (where the change-password card is) until they replace it.
  if (authStore.mustChangePassword && to.path !== ROUTES.account) return navigateTo(ROUTES.account)
})
