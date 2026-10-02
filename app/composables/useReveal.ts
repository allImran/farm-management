import type { MaybeElementRef } from '@vueuse/core'
import { unrefElement, useIntersectionObserver, usePreferredReducedMotion } from '@vueuse/core'

/**
 * Scroll-triggered "reveal" state for an element.
 *
 * Content is visible by default (SSR, no-JS, reduced motion). Only elements that start below
 * the fold are hidden on mount and revealed once they scroll into view, so nothing on the
 * first screen flickers.
 *
 * @param target - element to observe
 * @returns `isHidden` — true while the element is waiting to be revealed
 */
export const useReveal = (target: MaybeElementRef) => {
  const isHidden = ref(false)
  const reducedMotion = usePreferredReducedMotion()

  const { stop } = useIntersectionObserver(
    target,
    ([entry]) => {
      if (!entry?.isIntersecting) return
      isHidden.value = false
      stop()
    },
    { threshold: 0.12 }
  )

  onMounted(() => {
    const el = unrefElement(target)
    if (!el || reducedMotion.value === 'reduce') return stop()
    isHidden.value = el.getBoundingClientRect().top > window.innerHeight
    if (!isHidden.value) stop()
  })

  return { isHidden }
}
