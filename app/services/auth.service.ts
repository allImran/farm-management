import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
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
 * Subscribes to sign-in state. The callback fires once right away with the restored session.
 *
 * @returns an unsubscribe function.
 */
export const watchAuthUser = (callback: (user: AuthUser | null) => void) =>
  onAuthStateChanged(getAuth(), (user) => callback(user ? toAuthUser(user) : null))
