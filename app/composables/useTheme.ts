/** localStorage key holding the visitor's explicit theme choice (`'dark'` or `'light'`). */
const THEME_STORAGE_KEY = 'theme'

/**
 * Light/dark theme, applied as the `dark` class on `<html>` (Tailwind `darkMode: 'class'`).
 * An explicit choice is remembered; otherwise the system preference is used.
 *
 * @returns `isDark` (shared state), `toggle()` and `init()` (called once from app.vue on mount).
 */
export const useTheme = () => {
  const isDark = useState<boolean>('theme-dark', () => false)

  const apply = (dark: boolean) => {
    if (!import.meta.client) return
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light')
    } catch {
      // Storage can be blocked (private mode); the theme still applies for this visit.
    }
  }

  const commit = (dark: boolean) => {
    isDark.value = dark
    apply(dark)
  }

  /**
   * Cross-fades the whole page into the other theme with the View Transitions API, so colors
   * don't flip piecemeal. Browsers without it, and reduced-motion users, switch instantly.
   */
  const toggle = () => {
    const next = !isDark.value
    const canAnimate =
      import.meta.client &&
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canAnimate) return commit(next)
    // Wait for Vue to re-render (e.g. the toggle's icon) before the browser captures the new state.
    document.startViewTransition(async () => {
      commit(next)
      await nextTick()
    })
  }

  const init = () => {
    if (!import.meta.client) return
    let stored: string | null = null
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      // Fall back to the system preference.
    }
    isDark.value = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    apply(isDark.value)
  }

  return { isDark, toggle, init }
}
