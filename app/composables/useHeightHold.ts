import type { Ref, WatchSource } from 'vue'
import { useMutationObserver } from '@vueuse/core'

/** Safety net: never hold longer than this, even if something stays busy. */
const MAX_HOLD_MS = 3000

/**
 * Keeps an element at least as tall as it was when `source` changed, until its new content has
 * loaded. Swapping a tall panel for a short loading skeleton would otherwise shrink the page, so
 * the browser pulls the scroll position up and then (via scroll anchoring) back down once the
 * data arrives: the "page jumps" effect on tab changes.
 *
 * "Loaded" means nothing inside is `aria-busy="true"` any more (BaseAsyncState sets it while
 * pending). If the new content ends up shorter, the page shrinks once, after it has rendered.
 *
 * @param target the element to hold.
 * @param source what to watch, typically the active tab.
 */
export const useHeightHold = (target: Readonly<Ref<HTMLElement | null>>, source: WatchSource) => {
  let timer: ReturnType<typeof setTimeout> | undefined
  const isHolding = ref(false)

  const release = () => {
    clearTimeout(timer)
    isHolding.value = false
    if (target.value) target.value.style.minHeight = ''
  }

  const releaseIfSettled = () => {
    if (isHolding.value && !target.value?.querySelector('[aria-busy="true"]')) release()
  }

  // `pre` runs before the DOM swaps, so the old content's height is still measurable.
  watch(
    source,
    () => {
      const el = target.value
      if (!el) return
      clearTimeout(timer)
      el.style.minHeight = `${el.offsetHeight}px`
      isHolding.value = true
      timer = setTimeout(release, MAX_HOLD_MS)
    },
    { flush: 'pre' },
  )
  // The new content may render already loaded (e.g. data cached in a store).
  watch(source, () => nextTick(releaseIfSettled), { flush: 'post' })

  useMutationObserver(target, releaseIfSettled, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['aria-busy'],
  })

  onScopeDispose(() => clearTimeout(timer))
}
