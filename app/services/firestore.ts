import {
  collection,
  documentId,
  getCountFromServer,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  Timestamp,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { COLLECTIONS } from '~/constants/collections'
import type { Page, PageCursor, PageRequest } from '~/types/pagination'

/**
 * Shared Firestore helpers for the service layer. Only services import this file.
 */

/** The default Firestore instance (initialized by `plugins/firebase.client.ts`). */
export const db = () => getFirestore()

/** Converts a Firestore Timestamp field to a Date (null while a server timestamp is pending). */
export const toDate = (value: unknown): Date | null => (value instanceof Timestamp ? value.toDate() : null)

/** Converts an optional Date to a Firestore Timestamp. */
export const toTimestamp = (value: Date | null) => (value ? Timestamp.fromDate(value) : null)

/**
 * Sorts newest first by `field`, with the document id as tie-breaker so paging is deterministic
 * even when several docs share the same value.
 */
export const newestFirst = (field: string) => [orderBy(field, 'desc'), orderBy(documentId(), 'desc')]

/** Reads one doc. @returns the mapped doc, or `null` if it doesn't exist. */
export const fetchDocOrNull = async <T>(ref: DocumentReference, map: (snapshot: DocumentSnapshot<DocumentData>) => T) => {
  const snapshot = await getDoc(ref)
  return snapshot.exists() ? map(snapshot) : null
}

/** Reads the first doc of an ordered query (e.g. the latest one). @returns it mapped, or `null`. */
export const fetchFirst = async <T>(baseQuery: Query<DocumentData>, map: (snapshot: QueryDocumentSnapshot<DocumentData>) => T) => {
  const first = (await getDocs(query(baseQuery, limit(1)))).docs[0]
  return first ? map(first) : null
}

/**
 * Reads one page of `baseQuery`, which must already carry its `where`/`orderBy` clauses.
 * Fetches one extra doc to learn whether another page exists without a second read.
 */
export const fetchPage = async <T>(
  baseQuery: Query<DocumentData>,
  { pageSize, cursor }: PageRequest,
  map: (doc: QueryDocumentSnapshot<DocumentData>) => T,
): Promise<Page<T>> => {
  const constraints = cursor
    ? [startAfter(cursor as unknown as QueryDocumentSnapshot), limit(pageSize + 1)]
    : [limit(pageSize + 1)]
  const snapshot = await getDocs(query(baseQuery, ...constraints))
  const docs = snapshot.docs.slice(0, pageSize)
  const hasMore = snapshot.docs.length > pageSize
  const lastDoc = docs.at(-1)
  return {
    items: docs.map(map),
    // The cursor stays opaque outside the service layer (see types/pagination.ts).
    nextCursor: hasMore && lastDoc ? (lastDoc as unknown as PageCursor) : null,
    hasMore,
  }
}

/** Docs per request when `fetchAll` walks a query; keeps each response a reasonable size. */
const FETCH_ALL_CHUNK = 500

/**
 * Reads every doc matching `baseQuery` in bounded chunks. Only for data that is shown in full
 * (chart series, profit & loss totals), where a cut-off list would give wrong numbers.
 * `baseQuery` must carry a deterministic `orderBy` (ending in the document id).
 */
export const fetchAll = async <T>(
  baseQuery: Query<DocumentData>,
  map: (doc: QueryDocumentSnapshot<DocumentData>) => T,
): Promise<T[]> => {
  const items: T[] = []
  let cursor: PageCursor | null = null
  do {
    const page: Page<T> = await fetchPage(baseQuery, { pageSize: FETCH_ALL_CHUNK, cursor }, map)
    items.push(...page.items)
    cursor = page.nextCursor
  } while (cursor)
  return items
}

/** Firestore's `in` filter accepts at most 30 values. */
const IN_QUERY_LIMIT = 30

/** Splits values into groups small enough for one `in` filter each. */
export const inQueryChunks = <T>(values: T[]): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < values.length; i += IN_QUERY_LIMIT) chunks.push(values.slice(i, i + IN_QUERY_LIMIT))
  return chunks
}

/** A subcollection of `users/{uid}` (see `USER_COLLECTIONS`). */
export const userCollection = (uid: string, name: string) => collection(db(), COLLECTIONS.users, uid, name)

/** Server timestamps for a new doc; the rules require both to equal `request.time`. */
export const creationTimestamps = () => ({ createdAt: serverTimestamp(), updatedAt: serverTimestamp() })

/** Counts matching docs with an aggregate query (billed as one read per 1000 docs). */
export const countDocs = async (baseQuery: Query<DocumentData>) => (await getCountFromServer(baseQuery)).data().count
