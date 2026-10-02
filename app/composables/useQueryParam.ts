/**
 * Two-way binding between a route query parameter and a fixed set of values, so filters and
 * tabs survive reloads and work with the back button.
 *
 * @param key query parameter name.
 * @param allowed accepted values; anything else reads as `fallback`.
 * @param fallback value when the parameter is missing (kept out of the URL).
 */
export const useQueryParam = <T extends string>(key: string, allowed: readonly T[], fallback: T) => {
  const route = useRoute()
  const router = useRouter()

  return computed<T>({
    get: () => {
      const value = route.query[key]
      return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
    },
    set: (value) => {
      const query = { ...route.query, [key]: value === fallback ? undefined : value }
      router.replace({ query })
    },
  })
}
