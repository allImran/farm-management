import {
  addDoc,
  count,
  getAggregateFromServer,
  sum,
  deleteDoc,
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
  type QueryConstraint,
} from 'firebase/firestore'
import { USER_COLLECTIONS } from '~/constants/collections'
import { BATCH_RECORD_KINDS } from '~/constants/records'
import type { Batch, BatchInput, BatchStatus } from '~/types/models'
import type { PageRequest } from '~/types/pagination'
import { countDocs, creationTimestamps, fetchPage, toDate, userCollection } from './firestore'
import { request } from './network'

/** CRUD for `users/{uid}/batches`. */

const batches = (uid: string) => userCollection(uid, USER_COLLECTIONS.batches)

const toBatch = (snapshot: DocumentSnapshot<DocumentData>): Batch => {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id,
    farmId: data.farmId,
    name: data.name ?? '',
    breed: data.breed ?? '',
    startDate: data.startDate,
    initialQuantity: data.initialQuantity ?? 0,
    status: data.status,
    note: data.note ?? '',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

export interface BatchFilters {
  farmId?: string | null
  status?: BatchStatus | null
}

const filterConstraints = ({ farmId, status }: BatchFilters): QueryConstraint[] => [
  ...(farmId ? [where('farmId', '==', farmId)] : []),
  ...(status ? [where('status', '==', status)] : []),
]

/** Most recently started first. */
export const fetchBatchesPage = (uid: string, page: PageRequest, filters: BatchFilters = {}) =>
  request(() =>
    fetchPage(
      query(batches(uid), ...filterConstraints(filters), orderBy('startDate', 'desc'), orderBy(documentId(), 'desc')),
      page,
      toBatch,
    ),
  )

/** Number of matching batches and the chicks placed in them, from one aggregate query. */
export const summarizeBatches = (uid: string, filters: BatchFilters = {}) =>
  request(async () => {
    const snapshot = await getAggregateFromServer(query(batches(uid), ...filterConstraints(filters)), {
      batchCount: count(),
      birdCount: sum('initialQuantity'),
    })
    const totals = snapshot.data()
    return { batches: totals.batchCount, birds: totals.birdCount ?? 0 }
  })

/** @returns the batch, or `null` if it doesn't exist. */
export const fetchBatch = (uid: string, batchId: string) =>
  request(async () => {
    const snapshot = await getDoc(doc(batches(uid), batchId))
    return snapshot.exists() ? toBatch(snapshot) : null
  })

/** @returns the new batch's id. */
export const createBatch = (uid: string, input: BatchInput) =>
  request(async () => (await addDoc(batches(uid), { ...input, ...creationTimestamps() })).id)

/** `farmId` is immutable (enforced by the rules), so it's left out of updates. */
export const updateBatch = (uid: string, batchId: string, input: Omit<BatchInput, 'farmId'>) =>
  request(() => updateDoc(doc(batches(uid), batchId), { ...input, updatedAt: serverTimestamp() }))

export const deleteBatch = (uid: string, batchId: string) => request(() => deleteDoc(doc(batches(uid), batchId)))

/** Whether any record (feed, sale, ...) still references the batch; such batches can't be deleted. */
export const batchHasRecords = (uid: string, batch: Batch) =>
  request(async () => {
    const counts = await Promise.all(
      BATCH_RECORD_KINDS.map((kind) =>
        countDocs(
          query(userCollection(uid, USER_COLLECTIONS[kind]), where('farmId', '==', batch.farmId), where('batchId', '==', batch.id)),
        ),
      ),
    )
    return counts.some((count) => count > 0)
  })
