/**
 * The signed-in user's id for pages behind the `auth` middleware.
 *
 * @returns a getter that throws if called without a session (a programming error: the
 *          middleware guarantees one on every page that uses this).
 */
export const useSessionUid = () => {
  const { uid } = storeToRefs(useAuthStore())
  return () => {
    if (!uid.value) throw new Error('useSessionUid() used outside a signed-in page')
    return uid.value
  }
}
