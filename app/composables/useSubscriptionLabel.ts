import type { Subscription } from '~/types/models'
import { getSubscriptionState } from '~/utils/subscription'

type Tone = 'green' | 'yellow' | 'red' | 'slate' | 'blue' | 'purple'

const STATE_TONES = {
  lifetime: 'purple',
  active: 'green',
  scheduled: 'blue',
  expired: 'red',
  none: 'slate',
} as const satisfies Record<string, Tone>

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
    const params = {
      start: formatDate(subscription?.startsAt),
      // endsAt is exclusive; show the last day that still has access.
      end: formatDate(subscription?.endsAt ? new Date(subscription.endsAt.getTime() - 1) : null),
    }
    return { state, tone: STATE_TONES[state] as Tone, label: t(`billing.state.${state}`, params) }
  }

  return { describe }
}
