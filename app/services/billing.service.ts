import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { DEFAULT_EXTRA_FARM_PRICE } from '~/constants/billing'
import { COLLECTIONS, CONFIG_DOCS } from '~/constants/collections'
import type { PaymentRequest, PaymentRequestStatus, PlanConfig, Subscription } from '~/types/models'
import type { PageRequest } from '~/types/pagination'
import type { SubscriptionPeriod } from '~/utils/subscription'
import { db, fetchPage, inQueryChunks, toDate, toTimestamp } from './firestore'
import { request } from './network'

/**
 * Subscriptions, bKash payment requests and plan settings.
 * Approving/granting/revoking is admin-only and enforced by `firestore.rules`.
 */

const toSubscription = (snapshot: DocumentSnapshot<DocumentData>): Subscription => {
  const data = snapshot.data() ?? {}
  return {
    userId: snapshot.id,
    type: data.type,
    startsAt: toDate(data.startsAt),
    endsAt: toDate(data.endsAt),
    updatedAt: toDate(data.updatedAt),
  }
}

const toPaymentRequest = (snapshot: DocumentSnapshot<DocumentData>): PaymentRequest => {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id,
    userId: data.userId,
    userName: data.userName ?? '',
    userPhone: data.userPhone ?? '',
    bkashLast4: data.bkashLast4 ?? '',
    status: data.status,
    createdAt: toDate(data.createdAt),
    reviewedAt: toDate(data.reviewedAt),
    reviewNote: data.reviewNote ?? null,
  }
}

const subscriptionRef = (uid: string) => doc(db(), COLLECTIONS.subscriptions, uid)
const planRef = () => doc(db(), COLLECTIONS.config, CONFIG_DOCS.plan)

// ---- Subscriptions ----

/** @returns the user's subscription, or `null` if they never had one. */
export const fetchSubscription = (uid: string) =>
  request(async () => {
    const snapshot = await getDoc(subscriptionRef(uid))
    return snapshot.exists() ? toSubscription(snapshot) : null
  })

/** Admin only: subscriptions for a page of users, keyed by user id. */
export const fetchSubscriptionsByUserIds = (userIds: string[]) =>
  request(async () => {
    const snapshots = await Promise.all(
      inQueryChunks(userIds).map((ids) =>
        getDocs(query(collection(db(), COLLECTIONS.subscriptions), where(documentId(), 'in', ids), limit(ids.length))),
      ),
    )
    const byUser: Record<string, Subscription> = {}
    for (const snapshot of snapshots) {
      for (const docSnapshot of snapshot.docs) byUser[docSnapshot.id] = toSubscription(docSnapshot)
    }
    return byUser
  })

const toSubscriptionData = (period: SubscriptionPeriod, adminId: string) => ({
  type: period.type,
  startsAt: toTimestamp(period.startsAt),
  endsAt: toTimestamp(period.endsAt),
  updatedAt: serverTimestamp(),
  updatedBy: adminId,
})

/** Admin only: replaces the user's access period. */
export const saveSubscription = (uid: string, period: SubscriptionPeriod, adminId: string) =>
  request(() => setDoc(subscriptionRef(uid), toSubscriptionData(period, adminId)))

/** Admin only: removes write access entirely. */
export const deleteSubscription = (uid: string) => request(() => deleteDoc(subscriptionRef(uid)))

// ---- Payment requests ----

export interface NewPaymentRequest {
  userId: string
  userName: string
  userPhone: string
  bkashLast4: string
}

/** @returns the new request's id. */
export const createPaymentRequest = (input: NewPaymentRequest) =>
  request(async () => {
    const ref = await addDoc(collection(db(), COLLECTIONS.paymentRequests), {
      ...input,
      status: 'pending',
      createdAt: serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null,
      reviewNote: null,
    })
    return ref.id
  })

/** The user's most recent request, if any. */
export const fetchLatestPaymentRequest = (uid: string) =>
  request(async () => {
    const snapshot = await getDocs(
      query(
        collection(db(), COLLECTIONS.paymentRequests),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(1),
      ),
    )
    const first = snapshot.docs[0]
    return first ? toPaymentRequest(first) : null
  })

/** Admin only: requests with the given status, newest first. */
export const fetchPaymentRequestsPage = (page: PageRequest, status: PaymentRequestStatus) =>
  request(() =>
    fetchPage(
      query(
        collection(db(), COLLECTIONS.paymentRequests),
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        orderBy(documentId(), 'desc'),
      ),
      page,
      toPaymentRequest,
    ),
  )

/** Admin only: marks the request approved and grants the period in one atomic write. */
export const approvePaymentRequest = (paymentRequest: PaymentRequest, period: SubscriptionPeriod, adminId: string) =>
  request(() => {
    const batch = writeBatch(db())
    batch.update(doc(db(), COLLECTIONS.paymentRequests, paymentRequest.id), {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminId,
    })
    batch.set(subscriptionRef(paymentRequest.userId), toSubscriptionData(period, adminId))
    return batch.commit()
  })

/** Admin only. */
export const rejectPaymentRequest = (requestId: string, adminId: string, reviewNote: string | null) =>
  request(() =>
    updateDoc(doc(db(), COLLECTIONS.paymentRequests, requestId), {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminId,
      reviewNote,
    }),
  )

/** Slack's control characters; escaping stops a name like `<!channel>` from pinging everyone. */
const escapeSlack = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Posts a new payment request to the admin's Slack incoming webhook, straight from the browser
 * (the app is a static site, so there is no server to hide the URL behind).
 *
 * Slack webhooks don't answer CORS preflights, so this is a "simple" form-encoded request in
 * `no-cors` mode: Slack accepts the `payload` field, and the browser gets an opaque response,
 * which means success can't be confirmed and failures are silent by design.
 */
export const notifyPaymentRequest = (webhookUrl: string, input: NewPaymentRequest) =>
  request(async () => {
    const name = escapeSlack(input.userName)
    const phone = escapeSlack(input.userPhone)
    const digits = escapeSlack(input.bkashLast4)
    const message = {
      text: `New bKash payment request from ${name} (${phone}): paid from a number ending in ${digits}.`,
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*New bKash payment request*\n*Name:* ${name}\n*Phone:* ${phone}\n*Paid from:* ••••${digits}` },
        },
      ],
    }
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ payload: JSON.stringify(message) }),
    })
  })

// ---- Plan settings ----

const DEFAULT_PLAN: PlanConfig = { monthlyPrice: 0, extraFarmPrice: DEFAULT_EXTRA_FARM_PRICE, bkashNumber: '', instructions: '' }

/** @returns the plan, or defaults when the admin hasn't saved one yet. */
export const fetchPlanConfig = () =>
  request(async () => {
    const snapshot = await getDoc(planRef())
    const data = snapshot.data()
    if (!data) return { ...DEFAULT_PLAN }
    return {
      monthlyPrice: data.monthlyPrice ?? 0,
      // Plans saved before extra-farm pricing existed fall back to the default price.
      extraFarmPrice: data.extraFarmPrice ?? DEFAULT_EXTRA_FARM_PRICE,
      bkashNumber: data.bkashNumber ?? '',
      instructions: data.instructions ?? '',
    } satisfies PlanConfig
  })

/** Admin only. */
export const savePlanConfig = (plan: PlanConfig, adminId: string) =>
  request(() => setDoc(planRef(), { ...plan, updatedAt: serverTimestamp(), updatedBy: adminId }))
