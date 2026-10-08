import {
  addDoc,
  deleteDoc,
  deleteField,
  doc,
  documentId,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { USER_COLLECTIONS } from '~/constants/collections'
import type { Farm, FarmInput } from '~/types/models'
import type { PageRequest } from '~/types/pagination'
import { countDocs, creationTimestamps, fetchPage, toDate, userCollection } from './firestore'
import { request } from './network'

/** CRUD for `users/{uid}/farms`. */

const farms = (uid: string) => userCollection(uid, USER_COLLECTIONS.farms)

/**
 * Farms used to have a separate `location` next to `address`. Older docs are shown with both
 * merged into the address so nothing disappears; the next save stores the merged address and
 * drops `location` (see `updateFarm`).
 */
const legacyAddress = (data: DocumentData): string =>
  [data.address, data.location]
    .filter((part): part is string => typeof part === 'string' && part.trim() !== '')
    .join(', ')

const toFarm = (snapshot: DocumentSnapshot<DocumentData>): Farm => {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id,
    name: data.name ?? '',
    address: legacyAddress(data),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

/** Newest farms first. */
export const fetchFarmsPage = (uid: string, page: PageRequest) =>
  request(() => fetchPage(query(farms(uid), orderBy('createdAt', 'desc'), orderBy(documentId(), 'desc')), page, toFarm))

/** @returns the farm, or `null` if it doesn't exist. */
export const fetchFarm = (uid: string, farmId: string) =>
  request(async () => {
    const snapshot = await getDoc(doc(farms(uid), farmId))
    return snapshot.exists() ? toFarm(snapshot) : null
  })

export const countFarms = (uid: string) => request(() => countDocs(farms(uid)))

/** @returns the new farm's id. */
export const createFarm = (uid: string, input: FarmInput) =>
  request(async () => (await addDoc(farms(uid), { ...input, ...creationTimestamps() })).id)

export const updateFarm = (uid: string, farmId: string, input: FarmInput) =>
  request(() => updateDoc(doc(farms(uid), farmId), { ...input, location: deleteField(), updatedAt: serverTimestamp() }))

export const deleteFarm = (uid: string, farmId: string) => request(() => deleteDoc(doc(farms(uid), farmId)))

/**
 * Whether the farm still has batches or farm-level expenses. Farms are only deleted when
 * empty, so records never point at a missing farm.
 */
export const farmHasData = (uid: string, farmId: string) =>
  request(async () => {
    const [batches, expenses] = await Promise.all([
      countDocs(query(userCollection(uid, USER_COLLECTIONS.batches), where('farmId', '==', farmId))),
      countDocs(query(userCollection(uid, USER_COLLECTIONS.expenses), where('farmId', '==', farmId))),
    ])
    return batches + expenses > 0
  })
