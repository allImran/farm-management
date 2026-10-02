import type { Subscription, SubscriptionGrant, SubscriptionState, SubscriptionType } from '~/types/models'
import { addDays, addMonths, parseIsoDate } from './date'

/** Where a user's write access stands at `now`. */
export const getSubscriptionState = (subscription: Subscription | null, now = new Date()): SubscriptionState => {
  if (!subscription) return 'none'
  if (subscription.type === 'lifetime') return 'lifetime'
  if (!subscription.startsAt || !subscription.endsAt) return 'none'
  if (now < subscription.startsAt) return 'scheduled'
  return now < subscription.endsAt ? 'active' : 'expired'
}

/** Mirrors `hasActiveSubscription()` in `firestore.rules`; the rules are the real check. */
export const hasWriteAccess = (state: SubscriptionState) => state === 'lifetime' || state === 'active'

export interface SubscriptionPeriod {
  type: SubscriptionType
  startsAt: Date | null
  endsAt: Date | null
}

/**
 * Turns the admin's choice into a concrete access period.
 *
 * Month grants extend an active subscription from its current end date, so approving a
 * renewal early never loses the days already paid for. A custom range covers whole days, so
 * the exclusive end is the morning after `endDate`.
 */
export const resolveGrantPeriod = (
  grant: SubscriptionGrant,
  current: Subscription | null,
  now = new Date(),
): SubscriptionPeriod => {
  if (grant.mode === 'lifetime') return { type: 'lifetime', startsAt: null, endsAt: null }

  if (grant.mode === 'range') {
    return {
      type: 'period',
      startsAt: parseIsoDate(grant.startDate),
      endsAt: addDays(parseIsoDate(grant.endDate), 1),
    }
  }

  const isExtending = getSubscriptionState(current, now) === 'active' && current?.endsAt
  const startsAt = isExtending && current?.startsAt ? current.startsAt : now
  const base = isExtending && current?.endsAt ? current.endsAt : now
  return { type: 'period', startsAt, endsAt: addMonths(base, grant.months) }
}
