import type { AppError, RequestStatus, Result } from '~/types/network'

/**
 * Tracks one async call made through `request()`: its latest data, status and error.
 * Responses of a call that a newer call (or `reset()`) superseded are ignored.
 *
 * @param operation a service call returning a `Result`.
 * @returns `data`, `status`, `error`, `isLoading`, `execute(...args)`, which runs the call and
 *          resolves with its `Result` (so callers can branch on success), and `reset()`.
 */
export const useAsyncState = <T, Args extends unknown[]>(operation: (...args: Args) => Promise<Result<T>>) => {
  const data = shallowRef<T | null>(null)
  const status = ref<RequestStatus>('idle')
  const error = shallowRef<AppError | null>(null)
  let latestCall = 0

  const execute = async (...args: Args): Promise<Result<T>> => {
    const call = ++latestCall
    status.value = 'loading'
    error.value = null
    const result = await operation(...args)
    if (call !== latestCall) return result
    if (result.error) {
      error.value = result.error
      status.value = 'error'
    } else {
      data.value = result.data
      status.value = 'success'
    }
    return result
  }

  /** Back to `idle` with no data or error, e.g. when a dialog reopens. */
  const reset = () => {
    latestCall++
    data.value = null
    error.value = null
    status.value = 'idle'
  }

  const isLoading = computed(() => status.value === 'loading')

  return { data, status, error, isLoading, execute, reset }
}
