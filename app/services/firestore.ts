import {
  collection,
  getCountFromServer,
  getFirestore,
  serverTimestamp,
  getDocs,
  limit,
  query,
  startAfter,
  Timestamp,
  type DocumentData,
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

/** A subcollection of `users/{uid}` (see `USER_COLLECTIONS`). */
export const userCollection = (uid: string, name: string) => collection(db(), COLLECTIONS.users, uid, name)

/** Server timestamps for a new doc; the rules require both to equal `request.time`. */
export const creationTimestamps = () => ({ createdAt: serverTimestamp(), updatedAt: serverTimestamp() })

/** Counts matching docs with an aggregate query (billed as one read per 1000 docs). */
export const countDocs = async (baseQuery: Query<DocumentData>) => (await getCountFromServer(baseQuery)).data().count
