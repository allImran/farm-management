import { FARM_LEVEL_KEY } from '~/constants/finance'
import type { FarmRecord } from '~/types/records'
import { round, toFiniteNumber } from './number'

/**
 * Profit & loss maths for the dashboard, farm and batch reports. Pure functions, so the
 * "what if I leave out X" toggles recompute instantly without new reads.
 *
 * Profit = sales (sale `totalAmount`) − expenses (expense `amount`). Farm-level expenses
 * (no batch) count towards a farm's or the whole business's result, never a single batch's.
 */

export interface ProfitLossTotals {
  sales: number
  expenses: number
  profit: number
}

export interface ProfitLossFilter {
  /** Expense categories (`EXPENSE_TYPES`) left out of the result. */
  excludedCategories: readonly string[]
  /** Batch ids (or `FARM_LEVEL_KEY`) left out of the result. */
  excludedBatchKeys: readonly string[]
}

export interface ProfitLossReport {
  /** Everything that passes both filters. */
  totals: ProfitLossTotals
  /** Expenses per category after the batch filter only, so excluded categories still show their amount. */
  byCategory: Record<string, number>
  /** Per batch key after the category filter only, so excluded batches still show their result. */
  byBatch: Record<string, ProfitLossTotals>
  /** Per month (`YYYY-MM`, ascending) after both filters. */
  byMonth: Array<{ month: string } & ProfitLossTotals>
}

export const NO_FILTER: ProfitLossFilter = { excludedCategories: [], excludedBatchKeys: [] }

/** Rounds to whole paisa so float noise (0.1 + 0.2) never shows up in money. */
const roundMoney = (value: number) => round(value, 2)

const batchKeyOf = (record: Pick<FarmRecord, 'batchId'>) => record.batchId ?? FARM_LEVEL_KEY

/** Category of an expense; anything unexpected is reported as `other` rather than dropped. */
const categoryOf = (expense: FarmRecord) => (typeof expense.values.type === 'string' ? expense.values.type : 'other')

const emptyTotals = (): ProfitLossTotals => ({ sales: 0, expenses: 0, profit: 0 })

const finish = (totals: ProfitLossTotals): ProfitLossTotals => {
  const sales = roundMoney(totals.sales)
  const expenses = roundMoney(totals.expenses)
  return { sales, expenses, profit: roundMoney(sales - expenses) }
}

/**
 * Builds a report from raw expense and sale records.
 *
 * @param expenses expense records (batch-level and farm-level).
 * @param sales sale records.
 * @param filter categories and batches to leave out ("what if" toggles).
 */
export const buildProfitLoss = (
  expenses: readonly FarmRecord[],
  sales: readonly FarmRecord[],
  filter: ProfitLossFilter = NO_FILTER,
): ProfitLossReport => {
  const excludedCategories = new Set(filter.excludedCategories)
  const excludedBatches = new Set(filter.excludedBatchKeys)

  const totals = emptyTotals()
  const byCategory: Record<string, number> = {}
  const byBatch: Record<string, ProfitLossTotals> = {}
  const byMonth: Record<string, ProfitLossTotals> = {}

  const batchTotals = (key: string) => (byBatch[key] ??= emptyTotals())
  const monthTotals = (date: string) => (byMonth[date.slice(0, 7)] ??= emptyTotals())

  for (const expense of expenses) {
    const amount = toFiniteNumber(expense.values.amount)
    const category = categoryOf(expense)
    const batchKey = batchKeyOf(expense)
    const isCategoryIncluded = !excludedCategories.has(category)
    const isBatchIncluded = !excludedBatches.has(batchKey)

    if (isBatchIncluded) byCategory[category] = (byCategory[category] ?? 0) + amount
    if (isCategoryIncluded) batchTotals(batchKey).expenses += amount
    if (isCategoryIncluded && isBatchIncluded) {
      totals.expenses += amount
      monthTotals(expense.date).expenses += amount
    }
  }

  // Sales have no category, so only the batch filter applies to them.
  for (const sale of sales) {
    const amount = toFiniteNumber(sale.values.totalAmount)
    const batchKey = batchKeyOf(sale)
    batchTotals(batchKey).sales += amount
    if (!excludedBatches.has(batchKey)) {
      totals.sales += amount
      monthTotals(sale.date).sales += amount
    }
  }

  return {
    totals: finish(totals),
    byCategory: Object.fromEntries(Object.entries(byCategory).map(([key, value]) => [key, roundMoney(value)])),
    byBatch: Object.fromEntries(Object.entries(byBatch).map(([key, value]) => [key, finish(value)])),
    byMonth: Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month, ...finish(value) })),
  }
}
