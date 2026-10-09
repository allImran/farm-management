import { fetchSubscription, fetchSubscriptionsByUserIds } from '~/services/billing.service'
import { fetchUsersPage } from '~/services/users.service'
import type { AppError } from '~/types/network'
import type { Subscription } from '~/types/models'
import { normalizeBdPhone } from '~/utils/phone'

/**
 * Admin: all users as numbered pages, with each page's subscriptions fetched alongside.
 *
 * @param phoneSearch getter for a phone search term; a valid BD number narrows to that user.
 */
export const useAdminUsers = (phoneSearch: () => string) => {
  const phone = computed(() => normalizeBdPhone(phoneSearch()))
  const list = usePagination((page) => fetchUsersPage(page, { phone: phone.value }), { mode: 'pages', filters: phone })

  const subscriptions = shallowRef<Record<string, Subscription>>({})
  const subscriptionsError = shallowRef<AppError | null>(null)
  watch(list.items, async (users) => {
    if (!users.length) return
    const result = await fetchSubscriptionsByUserIds(users.map((user) => user.id))
    subscriptionsError.value = result.error
    if (result.data) subscriptions.value = { ...subscriptions.value, ...result.data }
  })

  /** Refreshes one user's subscription after the admin changes it. */
  const refreshSubscription = async (userId: string) => {
    const result = await fetchSubscription(userId)
    if (result.error) return
    const next = { ...subscriptions.value }
    if (result.data) next[userId] = result.data
    else delete next[userId]
    subscriptions.value = next
  }

  return { ...list, subscriptions, subscriptionsError, refreshSubscription }
}
