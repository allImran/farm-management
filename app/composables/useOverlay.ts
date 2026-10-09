import type { Ref } from 'vue'

/**
 * Behaviour shared by modals and drawers: while `isOpen` is true the page behind can't scroll
 * and Escape closes the overlay.
 *
 * @returns `close()`, which sets `isOpen` to false.
 */
export const useOverlay = (isOpen: Ref<boolean>) => {
  const close = () => {
    isOpen.value = false
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close()
  }

  const setOpen = (open: boolean) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) window.addEventListener('keydown', handleKeydown)
    else window.removeEventListener('keydown', handleKeydown)
  }

  watch(isOpen, setOpen)
  onBeforeUnmount(() => setOpen(false))

  return { close }
}
