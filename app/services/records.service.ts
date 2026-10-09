import {
  addDoc,
  deleteDoc,
  doc,
  documentId,
  getAggregateFromServer,
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
import { creationTimestamps, fetchAll, fetchFirst, fetchPage, newestFirst, toDate, userCollection } from './firestore'
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

/** Records in scope, newest date first (served by the `(farmId, batchId, date)` composite index). */
const scopedNewestFirst = (uid: string, kind: RecordKind, scope: RecordScope) =>
  query(scoped(uid, kind, scope), ...newestFirst('date'))

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
  request(() => fetchPage(scopedNewestFirst(uid, kind, scope), page, toRecord))

/** The most recent record of a kind, e.g. the latest weight sample. */
export const fetchLatestRecord = (uid: string, kind: RecordKind, scope: RecordScope) =>
  request(() => fetchFirst(scopedNewestFirst(uid, kind, scope), toRecord))

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

/**
 * Every record of a kind in one farm/batch, oldest first, for chart series. A batch lasts
 * weeks, so this stays small. Queried newest-first to reuse the list's composite index.
 */
export const fetchAllRecordsInScope = (uid: string, kind: RecordKind, scope: RecordScope) =>
  request(async () => (await fetchAll(scopedNewestFirst(uid, kind, scope), toRecord)).reverse())

/** Which records feed a profit & loss report: one batch, one farm (all its batches), or everything. */
export type FinanceScope = { farmId: string; batchId: string } | { farmId: string; batchId?: undefined } | null

/**
 * All expenses and sales in a profit & loss scope. A farm scope includes its farm-level
 * expenses (`batchId == null`). Batch scope reuses the list's composite index; farm and
 * all-farm scopes order by document id, which Firestore's automatic single-field indexes serve.
 */
export const fetchFinanceRecords = (uid: string, scope: FinanceScope) =>
  request(async () => {
    const load = (kind: 'expenses' | 'sales') => {
      if (scope?.batchId) {
        return fetchAll(scopedNewestFirst(uid, kind, { farmId: scope.farmId, batchId: scope.batchId }), toRecord)
      }
      const filters = scope ? [where('farmId', '==', scope.farmId)] : []
      return fetchAll(query(records(uid, kind), ...filters, orderBy(documentId())), toRecord)
    }
    const [expenses, sales] = await Promise.all([load('expenses'), load('sales')])
    return { expenses, sales }
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
