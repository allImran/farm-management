import { randomInt } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'

/**
 * Server-side code for the things the browser can't do. The web app is a static site, so this
 * is its only trusted backend.
 *
 * Keep these values in sync with the web app (`app/constants/auth.ts`, `collections.ts`).
 */

// Close to the users in Bangladesh. Must match FUNCTIONS_REGION in app/constants/auth.ts.
const REGION = 'asia-south1'
const PHONE_AUTH_EMAIL_DOMAIN = 'phone.broilerhq.app'
const BD_PHONE_PATTERN = /^01[3-9]\d{8}$/
/** Digits only, because the admin reads the temporary password to the user over the phone. */
const TEMP_PASSWORD_LENGTH = 10

const COLLECTIONS = {
  users: 'users',
  admins: 'admins',
  passwordResetRequests: 'passwordResetRequests',
} as const

initializeApp()
setGlobalOptions({ region: REGION, maxInstances: 5 })

/**
 * A fresh random one-time password. It must never be a fixed value: anyone can request a reset
 * for any number, so a known password would let them log in before the real owner does.
 */
const generateTempPassword = () => Array.from({ length: TEMP_PASSWORD_LENGTH }, () => randomInt(10)).join('')

/**
 * Admin only: approves a pending password-reset request.
 *
 * Sets the account's password to a random one-time password, signs it out everywhere (so nobody
 * keeps a session from before the reset) and flags the profile so the app makes the user pick
 * a new password right after logging in. The password is returned only to the admin, who reads
 * it to the owner on the call that verifies them; it is never stored.
 *
 * @param data.phone the request id, which is the normalized phone number.
 * @returns `{ password }`, the temporary password to give the user.
 * @throws `permission-denied` for non-admins or when the target is an admin account (reset
 *         those in the Firebase console), `failed-precondition` when the request isn't pending,
 *         `not-found` when no account uses that phone number.
 */
export const approvePasswordReset = onCall<{ phone?: unknown }>(async ({ auth, data }) => {
  if (!auth) throw new HttpsError('unauthenticated', 'Sign in first.')
  const db = getFirestore()
  const isAdmin = async (uid: string) => (await db.collection(COLLECTIONS.admins).doc(uid).get()).exists
  if (!(await isAdmin(auth.uid))) throw new HttpsError('permission-denied', 'Admins only.')

  const phone = data.phone
  if (typeof phone !== 'string' || !BD_PHONE_PATTERN.test(phone)) {
    throw new HttpsError('invalid-argument', 'A valid phone number is required.')
  }

  const user = await getAuth()
    .getUserByEmail(`${phone}@${PHONE_AUTH_EMAIL_DOMAIN}`)
    .catch((error: { code?: string }) => {
      if (error.code === 'auth/user-not-found') throw new HttpsError('not-found', 'No account uses this phone number.')
      throw error
    })
  // A tricked admin approving a forged request must not hand over another admin account.
  if (await isAdmin(user.uid)) throw new HttpsError('permission-denied', 'Admin accounts are reset in the Firebase console.')

  // Claim the request atomically so two approvals can't both run.
  const requestRef = db.collection(COLLECTIONS.passwordResetRequests).doc(phone)
  const userRef = db.collection(COLLECTIONS.users).doc(user.uid)
  const profileBefore = await db.runTransaction(async (transaction) => {
    const [request, profile] = await Promise.all([transaction.get(requestRef), transaction.get(userRef)])
    if (request.get('status') !== 'pending') throw new HttpsError('failed-precondition', 'This request is not pending.')
    // An account whose sign-up was interrupted has no profile doc; don't create a partial one.
    if (profile.exists) transaction.update(userRef, { mustChangePassword: true })
    transaction.update(requestRef, { status: 'approved', reviewedAt: FieldValue.serverTimestamp(), reviewedBy: auth.uid })
    return { exists: profile.exists, mustChangePassword: profile.get('mustChangePassword') === true }
  })

  const password = generateTempPassword()
  try {
    await getAuth().updateUser(user.uid, { password })
    await getAuth().revokeRefreshTokens(user.uid)
  } catch (error) {
    // Put things back so the admin can retry instead of leaving an "approved" request whose
    // password never changed.
    const batch = db.batch()
    batch.update(requestRef, { status: 'pending', reviewedAt: null, reviewedBy: null })
    if (profileBefore.exists) batch.update(userRef, { mustChangePassword: profileBefore.mustChangePassword })
    await batch.commit()
    throw error
  }

  return { password }
})
