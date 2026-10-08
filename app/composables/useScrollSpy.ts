/**
 * Tracks which of the given page sections is currently being read, for highlighting a table of
 * contents. A section counts as current once its top passes the upper third of the viewport.
 * @param ids - Element ids of the sections, in page order.
 * @returns `activeId`, or `null` before the first section is reached (and during SSR).
 */
export const useScrollSpy = (ids: MaybeRefOrGetter<string[]>) => {
  const activeId = ref<string | null>(null)
  let observer: IntersectionObserver | null = null

  const observe = () => {
    observer?.disconnect()
    if (!import.meta.client) return
    // The band between 0% and 33% from the top is the "reading" area.
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length) activeId.value = visible[0]!.target.id
      },
      { rootMargin: '0px 0px -67% 0px' }
    )
    for (const id of toValue(ids)) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
  }

  onMounted(observe)
  watch(() => toValue(ids), observe)
  onScopeDispose(() => observer?.disconnect())

  return { activeId }
}
