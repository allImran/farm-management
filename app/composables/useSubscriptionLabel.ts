import type { Subscription, SubscriptionState } from '~/types/models'
import type { Tone } from '~/types/ui'
import { getSubscriptionState, lastAccessDay } from '~/utils/subscription'

const STATE_TONES: Record<SubscriptionState, Tone> = {
  lifetime: 'purple',
  active: 'green',
  scheduled: 'blue',
  expired: 'red',
  none: 'slate',
}

/**
 * Human-readable subscription status, shared by the account page, banner and admin tables.
 *
 * @returns `describe(subscription)` → `{ state, tone, label }`, e.g. "Active until 3 Nov 2026".
 */
export const useSubscriptionLabel = () => {
  const { t } = useI18n()
  const { formatDate } = useLocaleDate()

  const describe = (subscription: Subscription | null, now = new Date()) => {
    const state = getSubscriptionState(subscription, now)
    const params = { start: formatDate(subscription?.startsAt), end: formatDate(lastAccessDay(subscription?.endsAt ?? null)) }
    return { state, tone: STATE_TONES[state], label: t(`billing.state.${state}`, params) }
  }

  return { describe }
}
