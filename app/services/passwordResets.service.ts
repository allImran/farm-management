import {
  collection,
  doc,
  getDoc,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { COLLECTIONS } from '~/constants/collections'
import type { PasswordResetRequest, PasswordResetStatus } from '~/types/models'
import type { PageRequest } from '~/types/pagination'
import { generateTempPassword } from '~/utils/password'
import { phoneToAuthEmail } from '~/utils/phone'
import { authorizeAuthAdmin, type AuthAdminConfig } from './authAdmin.service'
import { db, fetchPage, newestFirst, toDate } from './firestore'
import { request } from './network'

/**
 * Password-reset requests (`passwordResetRequests/{phone}`). There is no SMS or email to prove
 * who owns a number, so a signed-out user asks and the admin decides after checking with them.
 * Approving sets the password through Google's Identity Toolkit API with the admin's own Google
 * token (see `authAdmin.service.ts`), since the free plan has no Cloud Functions.
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

const failure = (code: string) => Object.assign(new Error(code), { code })

/**
 * Admin only: approves a pending request. Sets the account's password to a random one-time
 * password, signs it out everywhere, marks the request approved and flags the profile so the
 * app makes the user pick a new password right after logging in. The password is returned only
 * to the admin, who reads it to the owner on the call that verifies them; it is never stored.
 *
 * Call from the admin's click: it may open Google's sign-in popup first.
 *
 * @returns the temporary password.
 * @throws `not-found` (no account uses the number), `reset-admin-account` (admins reset their
 *         own password while signed in), `failed-precondition` (not pending any more),
 *         `google-sign-in-failed` / `google-permission-denied` (Google refused the admin).
 */
export const approvePasswordResetRequest = (config: AuthAdminConfig, phone: string, adminId: string) =>
  request(async () => {
    const authAdmin = await authorizeAuthAdmin(config)
    const uid = await authAdmin.findUid(phoneToAuthEmail(phone))
    if (!uid) throw failure('not-found')

    const [isAdminAccount, pendingRequest, profile] = await Promise.all([
      getDoc(doc(db(), COLLECTIONS.admins, uid)),
      getDoc(requestRef(phone)),
      getDoc(doc(db(), COLLECTIONS.users, uid)),
    ])
    // A tricked admin approving a forged request must not hand over another admin account.
    if (isAdminAccount.exists()) throw failure('reset-admin-account')
    if (pendingRequest.data()?.status !== 'pending') throw failure('failed-precondition')

    const password = generateTempPassword()
    await authAdmin.setPassword(uid, password)

    const batch = writeBatch(db())
    batch.update(requestRef(phone), { status: 'approved', reviewedAt: serverTimestamp(), reviewedBy: adminId })
    // An account whose sign-up was interrupted has no profile doc; don't create a partial one.
    if (profile.exists()) batch.update(profile.ref, { mustChangePassword: true })
    // The password has already changed, so the admin must get it even if this bookkeeping fails.
    await batch.commit().catch(() => undefined)
    return password
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
