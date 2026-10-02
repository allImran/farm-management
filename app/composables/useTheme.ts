export const useTheme = () => {
  const isDark = useState<boolean>('theme-dark', () => false)

  const apply = (dark: boolean) => {
    if (import.meta.client) {
      const html = document.documentElement
      html.classList.toggle('dark', dark)
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    }
  }

  const toggle = () => {
    isDark.value = !isDark.value
    apply(isDark.value)
  }

  const init = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = stored ? stored === 'dark' : prefersDark
      apply(isDark.value)
    }
  }

  return { isDark, toggle, init }
}
