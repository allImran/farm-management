import {
  collection,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  documentId,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { COLLECTIONS } from '~/constants/collections'
import type { UserProfile } from '~/types/models'
import type { PageRequest } from '~/types/pagination'
import { db, fetchPage, toDate } from './firestore'
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
  }
}

const userRef = (uid: string) => doc(db(), COLLECTIONS.users, uid)

/** @returns the profile, or `null` when the account has none yet. */
export const fetchUserProfile = (uid: string) =>
  request(async () => {
    const snapshot = await getDoc(userRef(uid))
    return snapshot.exists() ? toProfile(snapshot) : null
  })

export interface NewProfile {
  name: string
  phone: string
  email: string | null
}

export const createUserProfile = (uid: string, profile: NewProfile) =>
  request(() => setDoc(userRef(uid), { ...profile, createdAt: serverTimestamp() }))

export const updateUserProfile = (uid: string, changes: Pick<NewProfile, 'name' | 'email'>) =>
  request(() => updateDoc(userRef(uid), changes))

/** Whether `uid` has an `admins/{uid}` doc. Rules only allow reading your own. */
export const fetchIsAdmin = (uid: string) =>
  request(async () => (await getDoc(doc(db(), COLLECTIONS.admins, uid))).exists())

/** Admin only: newest accounts first, optionally narrowed to one (normalized) phone number. */
export const fetchUsersPage = (page: PageRequest, filters: { phone?: string | null } = {}) =>
  request(() => {
    const base = filters.phone
      ? query(collection(db(), COLLECTIONS.users), where('phone', '==', filters.phone), orderBy(documentId()))
      : query(collection(db(), COLLECTIONS.users), orderBy('createdAt', 'desc'), orderBy(documentId(), 'desc'))
    return fetchPage(base, page, toProfile)
  })
