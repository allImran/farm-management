export const useChartTheme = () => {
  const isDark = ref(false)
  let observer: MutationObserver | null = null

  const sync = () => {
    if (import.meta.client) {
      isDark.value = document.documentElement.classList.contains('dark')
    }
  }

  onMounted(() => {
    sync()
    observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  const gridColor = 'rgba(148, 163, 184, 0.15)'
  const tickColor = computed(() => (isDark.value ? '#94a3b8' : '#64748b'))
  const tooltipBg = '#0f172a'

  return { isDark, gridColor, tickColor, tooltipBg }
}
