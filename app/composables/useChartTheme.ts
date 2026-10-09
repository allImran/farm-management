import { CHART_THEME } from '~/constants/charts'
import type { ChartSeries } from '~/types/charts'

/** The parts of a Chart.js tooltip item the label callback reads (same for bar and line charts). */
interface TooltipContext {
  datasetIndex: number
  parsed: { y: number | null }
  formattedValue: string
}

type Format = (value: number) => string

/**
 * Chart.js option builders shared by every chart, so they all look alike and follow the
 * light/dark theme. Call them inside a `computed` so the options update when the theme changes.
 *
 * @returns `legend(isShown)`, `tooltip(label, showColors?)`, `seriesLabel(series)` (tooltip
 *          label using each series' formatter), `xAxis()` and `yAxis(format?)`.
 */
export const useChartTheme = () => {
  const { isDark } = useTheme()
  const tickColor = computed(() => (isDark.value ? CHART_THEME.tickDark : CHART_THEME.tickLight))

  const legend = (isShown: boolean) => ({
    display: isShown,
    position: 'bottom' as const,
    labels: { color: tickColor.value, usePointStyle: true, boxWidth: 8, padding: 16 },
  })

  const tooltip = <C>(label: (context: C) => string, showColors = false) => ({
    backgroundColor: CHART_THEME.tooltipBackground,
    padding: 12,
    cornerRadius: 12,
    displayColors: showColors,
    titleColor: CHART_THEME.tooltipTitle,
    titleFont: { weight: 'normal' as const, size: 11 },
    bodyColor: CHART_THEME.tooltipBody,
    bodyFont: { weight: 'bold' as const, size: 14 },
    callbacks: { label },
  })

  // With several series the tooltip lists them all, so each value needs its series' name.
  const seriesLabel = (series: readonly ChartSeries[]) => (context: TooltipContext) => {
    const current = series[context.datasetIndex]
    const formatted = current?.format ? current.format(context.parsed.y ?? 0) : context.formattedValue
    return series.length > 1 ? `${current?.label ?? ''}: ${formatted}` : formatted
  }

  const xAxis = () => ({ grid: { display: false }, border: { display: false }, ticks: { color: tickColor.value } })

  const yAxis = (format?: Format) => ({
    grid: { color: CHART_THEME.grid },
    border: { display: false },
    ticks: { color: tickColor.value, ...(format ? { callback: (value: string | number) => format(Number(value)) } : {}) },
  })

  return { legend, tooltip, seriesLabel, xAxis, yAxis }
}
