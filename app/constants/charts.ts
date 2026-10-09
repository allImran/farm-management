import type { ExpenseType } from '~/types/models'

/**
 * Chart colors as hex: charts draw on a canvas, which can't read Tailwind classes.
 * The first five mirror the `accent-*` tokens in `tailwind.config.ts`; the rest are Tailwind's
 * default 500-700 shades, needed so the batch and farm-level expense categories stay distinguishable.
 */
export const CHART_COLORS = {
  blue: '#3b6ef6',
  green: '#22c55e',
  purple: '#8b6cf2',
  yellow: '#f5b700',
  red: '#ef4444',
  teal: '#14b8a6',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#0891b2',
  slate: '#94a3b8',
  amber: '#b45309',
  indigo: '#6366f1',
  sky: '#0ea5e9',
  lime: '#65a30d',
  fuchsia: '#c026d3',
} as const

/** Fixed color per expense category, so a category looks the same on every chart. */
export const EXPENSE_TYPE_COLORS: Record<ExpenseType, string> = {
  chicks: CHART_COLORS.yellow,
  feed: CHART_COLORS.green,
  medicine: CHART_COLORS.red,
  labor: CHART_COLORS.blue,
  electricity: CHART_COLORS.purple,
  transport: CHART_COLORS.orange,
  litter: CHART_COLORS.teal,
  equipment: CHART_COLORS.cyan,
  rent: CHART_COLORS.pink,
  construction: CHART_COLORS.amber,
  electrical: CHART_COLORS.indigo,
  water: CHART_COLORS.sky,
  cleaning: CHART_COLORS.lime,
  fees: CHART_COLORS.fuchsia,
  other: CHART_COLORS.slate,
}

/**
 * Longest x-axis a batch chart draws, in days. A broiler batch runs 30–45 days; the cap only
 * guards against a mistyped record date (e.g. year 2062) stretching the axis to thousands of days.
 */
export const MAX_SERIES_DAYS = 120
