import {
  collection,
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
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { COLLECTIONS } from '~/constants/collections'
import type { NewProfile, UserProfile } from '~/types/models'
import type { PageRequest } from '~/types/pagination'
import { db, fetchDocOrNull, fetchPage, inQueryChunks, newestFirst, toDate } from './firestore'
import { request } from './network'

/** Profile and admin-membership reads/writes for `users/{uid}` and `admins/{uid}`. */

const toProfile = (snapshot: DocumentSnapshot<DocumentData>): UserProfile => {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id,
    name: data.name ?? '',
    phone: data.phone ?? '',
    email: data.email ?? null,
    createdAt: toDate(data.createdAt),
    mustChangePassword: data.mustChangePassword === true,
  }
}

const userRef = (uid: string) => doc(db(), COLLECTIONS.users, uid)

/** @returns the profile, or `null` when the account has none yet. */
export const fetchUserProfile = (uid: string) => request(() => fetchDocOrNull(userRef(uid), toProfile))

export const createUserProfile = (uid: string, profile: NewProfile) =>
  request(() => setDoc(userRef(uid), { ...profile, createdAt: serverTimestamp() }))

export const updateUserProfile = (uid: string, changes: Pick<NewProfile, 'name' | 'email'>) =>
  request(() => updateDoc(userRef(uid), changes))

/** Clears the "change your temporary password" flag after the user picked a new password. */
export const clearMustChangePassword = (uid: string) => request(() => updateDoc(userRef(uid), { mustChangePassword: false }))

/** Whether `uid` has an `admins/{uid}` doc. Rules only allow reading your own. */
export const fetchIsAdmin = (uid: string) =>
  request(async () => (await getDoc(doc(db(), COLLECTIONS.admins, uid))).exists())

/** Admin only: profiles for a page of (normalized) phone numbers, keyed by phone. */
export const fetchUsersByPhones = (phones: string[]) =>
  request(async () => {
    const snapshots = await Promise.all(
      inQueryChunks(phones).map((chunk) =>
        getDocs(query(collection(db(), COLLECTIONS.users), where('phone', 'in', chunk), orderBy(documentId()), limit(chunk.length))),
      ),
    )
    const byPhone: Record<string, UserProfile> = {}
    for (const snapshot of snapshots) {
      for (const docSnapshot of snapshot.docs) {
        const profile = toProfile(docSnapshot)
        byPhone[profile.phone] = profile
      }
    }
    return byPhone
  })

/** Admin only: newest accounts first, optionally narrowed to one (normalized) phone number. */
export const fetchUsersPage = (page: PageRequest, filters: { phone?: string | null } = {}) =>
  request(() => {
    const base = filters.phone
      ? query(collection(db(), COLLECTIONS.users), where('phone', '==', filters.phone), orderBy(documentId()))
      : query(collection(db(), COLLECTIONS.users), ...newestFirst('createdAt'))
    return fetchPage(base, page, toProfile)
  })
