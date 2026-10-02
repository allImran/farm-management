import type { Result } from './network'

/**
 * Opaque position in a paged query. Services create it (a Firestore document snapshot) and get
 * it back unchanged; nothing outside the service layer inspects it.
 */
declare const pageCursorBrand: unique symbol
export type PageCursor = { readonly [pageCursorBrand]: true }

export interface PageRequest {
  pageSize: number
  cursor: PageCursor | null
}

export interface Page<T> {
  items: T[]
  nextCursor: PageCursor | null
  hasMore: boolean
}

export type PageFetcher<T> = (request: PageRequest) => Promise<Result<Page<T>>>
