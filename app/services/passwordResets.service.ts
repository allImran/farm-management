import {
  collection,
  doc,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { FUNCTIONS_REGION } from '~/constants/auth'
import { COLLECTIONS } from '~/constants/collections'
import type { PasswordResetRequest, PasswordResetStatus } from '~/types/models'
import type { PageRequest } from '~/types/pagination'
import { db, fetchPage, newestFirst, toDate } from './firestore'
import { request } from './network'

/**
 * Password-reset requests (`passwordResetRequests/{phone}`). There is no SMS or email to prove
 * who owns a number, so a signed-out user asks and the admin decides after checking with them.
 * Approving runs in a Cloud Function: only the Admin SDK can set someone else's password.
 */

const toPasswordResetRequest = (snapshot: DocumentSnapshot<DocumentData>): PasswordResetRequest => {
  const data = snapshot.data() ?? {}
  return {
    phone: snapshot.id,
    status: data.status,
    createdAt: toDate(data.createdAt),
    reviewedAt: toDate(data.reviewedAt),
  }
}

const requestRef = (phone: string) => doc(db(), COLLECTIONS.passwordResetRequests, phone)

/**
 * Signed-out users: asks the admin to reset the password of `phone` (normalized). One doc per
 * number, so asking again just refreshes the existing request instead of piling up duplicates.
 */
export const createPasswordResetRequest = (phone: string) =>
  request(() =>
    setDoc(requestRef(phone), {
      phone,
      status: 'pending',
      createdAt: serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null,
    }),
  )

/** Admin only: requests with the given status, newest first. */
export const fetchPasswordResetRequestsPage = (page: PageRequest, status: PasswordResetStatus) =>
  request(() =>
    fetchPage(
      query(collection(db(), COLLECTIONS.passwordResetRequests), where('status', '==', status), ...newestFirst('createdAt')),
      page,
      toPasswordResetRequest,
    ),
  )

/**
 * Admin only: sets the account's password to a random one-time password (see
 * `functions/src/index.ts`) and resolves with it, so the admin can read it to the owner.
 */
export const approvePasswordResetRequest = (phone: string) =>
  request(async () => {
    const approve = httpsCallable<{ phone: string }, { password: string }>(getFunctions(undefined, FUNCTIONS_REGION), 'approvePasswordReset')
    return (await approve({ phone })).data.password
  })

/** Admin only. */
export const rejectPasswordResetRequest = (phone: string, adminId: string) =>
  request(() =>
    updateDoc(requestRef(phone), {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminId,
    }),
  )
