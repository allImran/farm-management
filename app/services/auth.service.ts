import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User,
} from 'firebase/auth'
import { phoneToAuthEmail } from '~/utils/phone'
import { request } from './network'

/**
 * Firebase Auth calls. Accounts use phone + password; the phone is mapped to a synthetic
 * email (see `constants/auth.ts`), so `phone` must already be normalized.
 */

export interface AuthUser {
  uid: string
  email: string | null
}

const toAuthUser = (user: User): AuthUser => ({ uid: user.uid, email: user.email })

/** Creates an account and signs it in. */
export const signUpWithPhone = (phone: string, password: string) =>
  request(async () => toAuthUser((await createUserWithEmailAndPassword(getAuth(), phoneToAuthEmail(phone), password)).user))

export const signInWithPhone = (phone: string, password: string) =>
  request(async () => toAuthUser((await signInWithEmailAndPassword(getAuth(), phoneToAuthEmail(phone), password)).user))

export const signOutUser = () => request(() => signOut(getAuth()))

/**
 * Changes the signed-in user's password. Firebase only allows this right after a sign-in, so
 * the current password is checked first; a wrong one fails with `auth/invalid-credential`.
 */
export const changeUserPassword = (currentPassword: string, newPassword: string) =>
  request(async () => {
    const user = getAuth().currentUser
    if (!user?.email) throw Object.assign(new Error('Not signed in'), { code: 'unauthenticated' })
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword))
    await updatePassword(user, newPassword)
  })

/**
 * Subscribes to sign-in state. The callback fires once right away with the restored session.
 *
 * @returns an unsubscribe function.
 */
export const watchAuthUser = (callback: (user: AuthUser | null) => void) =>
  onAuthStateChanged(getAuth(), (user) => callback(user ? toAuthUser(user) : null))
