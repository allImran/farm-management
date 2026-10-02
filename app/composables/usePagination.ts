import { MAX_PAGE_SIZE, PAGE_SIZE } from '~/constants/pagination'
import type { AppError, RequestStatus } from '~/types/network'
import type { PageCursor, PageFetcher } from '~/types/pagination'

type PaginationMode = 'append' | 'pages'

interface PaginationOptions {
  pageSize?: number
  /**
   * `append`: "Load more" lists that keep earlier items (mobile, feeds).
   * `pages`: numbered pages for admin tables, one page of items at a time.
   */
  mode?: PaginationMode
}

/**
 * Cursor-based pagination for any service that returns `Page<T>`.
 *
 * In `pages` mode the start cursor of every visited page is remembered, so `goToPage()` can
 * jump to any page already seen or the next one. `totalPages` is the number of pages known so
 * far; it grows by one while more data exists, which avoids paying for a count query.
 *
 * @param fetcher service call for one page; recreate the list (call `reset()`) when its filters change.
 */
export const usePagination = <T>(fetcher: PageFetcher<T>, options: PaginationOptions = {}) => {
  const pageSize = Math.min(options.pageSize ?? PAGE_SIZE, MAX_PAGE_SIZE)
  const mode = options.mode ?? 'append'

  const items = shallowRef<T[]>([])
  /** State of the first page / current page. */
  const status = ref<RequestStatus>('idle')
  const error = shallowRef<AppError | null>(null)
  /** State of "Load more" in append mode; failures keep the loaded items. */
  const loadMoreStatus = ref<RequestStatus>('idle')
  const loadMoreError = shallowRef<AppError | null>(null)
  const hasMore = ref(false)
  const currentPage = ref(1)
  // pageStarts[i] is the cursor that starts page i + 1.
  const pageStarts = shallowRef<(PageCursor | null)[]>([null])
  let nextCursor: PageCursor | null = null
  let generation = 0

  const totalPages = computed(() => pageStarts.value.length)
  const isEmpty = computed(() => status.value === 'success' && items.value.length === 0)

  const loadPage = async (page: number) => {
    const call = ++generation
    status.value = 'loading'
    error.value = null
    const result = await fetcher({ pageSize, cursor: pageStarts.value[page - 1] ?? null })
    if (call !== generation) return
    if (result.error) {
      error.value = result.error
      status.value = 'error'
      return
    }
    items.value = result.data.items
    hasMore.value = result.data.hasMore
    nextCursor = result.data.nextCursor
    currentPage.value = page
    const starts = pageStarts.value.slice(0, page)
    if (result.data.hasMore) starts.push(result.data.nextCursor)
    pageStarts.value = starts
    status.value = 'success'
  }

  /** Clears everything and loads the first page (call after filters change or data is edited). */
  const reset = () => {
    pageStarts.value = [null]
    items.value = []
    hasMore.value = false
    nextCursor = null
    loadMoreStatus.value = 'idle'
    loadMoreError.value = null
    return loadPage(1)
  }

  /** Append mode: fetches the next page and adds it below the current items. */
  const loadMore = async () => {
    if (!hasMore.value || loadMoreStatus.value === 'loading' || status.value === 'loading') return
    const call = generation
    loadMoreStatus.value = 'loading'
    loadMoreError.value = null
    const result = await fetcher({ pageSize, cursor: nextCursor })
    if (call !== generation) return
    if (result.error) {
      loadMoreError.value = result.error
      loadMoreStatus.value = 'error'
      return
    }
    items.value = [...items.value, ...result.data.items]
    hasMore.value = result.data.hasMore
    nextCursor = result.data.nextCursor
    loadMoreStatus.value = 'success'
  }

  /** Pages mode: shows a page whose start cursor is known (any visited page, or the next one). */
  const goToPage = (page: number) => {
    if (mode !== 'pages' || page < 1 || page > totalPages.value) return
    return loadPage(page)
  }

  /** Re-fetches the current page in place (pages mode) or from the start (append mode). */
  const refresh = () => (mode === 'pages' ? loadPage(currentPage.value) : reset())

  return {
    items,
    status,
    error,
    isEmpty,
    hasMore,
    loadMoreStatus,
    loadMoreError,
    currentPage,
    totalPages,
    reset,
    refresh,
    loadMore,
    goToPage,
  }
}
