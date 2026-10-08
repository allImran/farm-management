import {
  addDoc,
  deleteDoc,
  doc,
  documentId,
  getAggregateFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  sum,
  updateDoc,
  where,
  type AggregateField,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { USER_COLLECTIONS } from '~/constants/collections'
import type { IsoDate } from '~/types/models'
import type { PageRequest } from '~/types/pagination'
import type { FarmRecord, RecordKind, RecordScope, RecordValues } from '~/types/records'
import { creationTimestamps, fetchPage, toDate, userCollection } from './firestore'
import { request } from './network'

/**
 * Generic CRUD for the record kinds in `constants/records.ts` (expenses, feeds, medicines,
 * mortalities, weights, sales). Fields are stored flat on the doc; `values` holds everything
 * besides the shared farmId/batchId/date/timestamps.
 */

const RESERVED_KEYS = new Set(['farmId', 'batchId', 'date', 'createdAt', 'updatedAt'])

const records = (uid: string, kind: RecordKind) => userCollection(uid, USER_COLLECTIONS[kind])

/** Every record query filters on both ids; farm-level expenses have `batchId == null`. */
const scoped = (uid: string, kind: RecordKind, scope: RecordScope) =>
  query(records(uid, kind), where('farmId', '==', scope.farmId), where('batchId', '==', scope.batchId))

const toRecord = (snapshot: DocumentSnapshot<DocumentData>): FarmRecord => {
  const data = snapshot.data() ?? {}
  const values: RecordValues = {}
  for (const [key, value] of Object.entries(data)) {
    if (!RESERVED_KEYS.has(key)) values[key] = value
  }
  return {
    id: snapshot.id,
    farmId: data.farmId,
    batchId: data.batchId ?? null,
    date: data.date,
    values,
    createdAt: toDate(data.createdAt),
  }
}

/** Newest date first. */
export const fetchRecordsPage = (uid: string, kind: RecordKind, scope: RecordScope, page: PageRequest) =>
  request(() =>
    fetchPage(query(scoped(uid, kind, scope), orderBy('date', 'desc'), orderBy(documentId(), 'desc')), page, toRecord),
  )

/** The most recent record of a kind, e.g. the latest weight sample. */
export const fetchLatestRecord = (uid: string, kind: RecordKind, scope: RecordScope) =>
  request(async () => {
    const snapshot = await getDocs(query(scoped(uid, kind, scope), orderBy('date', 'desc'), orderBy(documentId(), 'desc'), limit(1)))
    const first = snapshot.docs[0]
    return first ? toRecord(first) : null
  })

/**
 * Sums numeric fields across all records in scope with one aggregate query.
 * Each summed field needs a (farmId, batchId, field) index in firestore.indexes.json.
 *
 * @returns totals keyed by field name (0 when there are no records).
 */
export const sumRecordFields = <F extends string>(uid: string, kind: RecordKind, scope: RecordScope, fields: F[]) =>
  request(async () => {
    // Positional aliases keep field names such as `count` from clashing with aggregate keywords.
    const spec: Record<string, AggregateField<number>> = {}
    fields.forEach((field, index) => {
      spec[`sum${index}`] = sum(field)
    })
    const totals = (await getAggregateFromServer(scoped(uid, kind, scope), spec)).data()
    return Object.fromEntries(fields.map((field, index) => [field, totals[`sum${index}`] ?? 0])) as Record<F, number>
  })

export interface RecordInput {
  date: IsoDate
  values: RecordValues
}

/** @returns the new record's id. */
export const createRecord = (uid: string, kind: RecordKind, scope: RecordScope, input: RecordInput) =>
  request(async () => {
    const ref = await addDoc(records(uid, kind), {
      ...input.values,
      farmId: scope.farmId,
      batchId: scope.batchId,
      date: input.date,
      ...creationTimestamps(),
    })
    return ref.id
  })

/** farmId/batchId are immutable (enforced by the rules). */
export const updateRecord = (uid: string, kind: RecordKind, recordId: string, input: RecordInput) =>
  request(() =>
    updateDoc(doc(records(uid, kind), recordId), { ...input.values, date: input.date, updatedAt: serverTimestamp() }),
  )

export const deleteRecord = (uid: string, kind: RecordKind, recordId: string) =>
  request(() => deleteDoc(doc(records(uid, kind), recordId)))
