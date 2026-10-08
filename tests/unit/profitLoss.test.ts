import { describe, expect, it } from 'vitest'
import { FARM_LEVEL_KEY } from '~/constants/finance'
import type { FarmRecord } from '~/types/records'
import { buildProfitLoss } from '~/utils/profitLoss'

let nextId = 0
const record = (batchId: string | null, date: string, values: FarmRecord['values']): FarmRecord => ({
  id: String(++nextId),
  farmId: 'farm1',
  batchId,
  date,
  values,
  createdAt: null,
})
const expense = (batchId: string | null, type: string, amount: number, date = '2026-09-10') =>
  record(batchId, date, { type, amount, contactId: null, note: null })
const sale = (batchId: string, totalAmount: number, date = '2026-09-20') =>
  record(batchId, date, { quantity: 10, weight: 20, unitPrice: 150, totalAmount, contactId: null, note: null })

const expenses = [
  expense('b1', 'chicks', 50000),
  expense('b1', 'feed', 80000),
  expense('b1', 'medicine', 5000),
  expense('b2', 'feed', 60000, '2026-10-02'),
  expense('b2', 'medicine', 3000, '2026-10-02'),
  expense(null, 'electricity', 4000, '2026-10-05'),
]
const sales = [sale('b1', 160000), sale('b2', 55000, '2026-10-15')]

describe('buildProfitLoss', () => {
  it('totals every batch plus farm-level expenses', () => {
    const { totals } = buildProfitLoss(expenses, sales)
    expect(totals).toEqual({ sales: 215000, expenses: 202000, profit: 13000 })
  })

  it('keeps farm-level expenses out of every batch result', () => {
    const { byBatch } = buildProfitLoss(expenses, sales)
    expect(byBatch.b1).toEqual({ sales: 160000, expenses: 135000, profit: 25000 })
    expect(byBatch.b2).toEqual({ sales: 55000, expenses: 63000, profit: -8000 })
    expect(byBatch[FARM_LEVEL_KEY]).toEqual({ sales: 0, expenses: 4000, profit: -4000 })
  })

  it('shows the effect of leaving out a category', () => {
    const report = buildProfitLoss(expenses, sales, { excludedCategories: ['medicine'], excludedBatchKeys: [] })
    expect(report.totals).toEqual({ sales: 215000, expenses: 194000, profit: 21000 })
    // Category amounts stay visible so the toggle list can show what was left out.
    expect(report.byCategory.medicine).toBe(8000)
    expect(report.byBatch.b1!.expenses).toBe(130000)
  })

  it('shows the effect of leaving out a batch, including its sales', () => {
    const report = buildProfitLoss(expenses, sales, { excludedCategories: [], excludedBatchKeys: ['b2'] })
    expect(report.totals).toEqual({ sales: 160000, expenses: 139000, profit: 21000 })
    expect(report.byCategory.feed).toBe(80000)
    // Batch results stay visible so the toggle list can show what was left out.
    expect(report.byBatch.b2!.profit).toBe(-8000)
  })

  it('can leave out farm-level expenses', () => {
    const report = buildProfitLoss(expenses, sales, { excludedCategories: [], excludedBatchKeys: [FARM_LEVEL_KEY] })
    expect(report.totals.expenses).toBe(198000)
    expect(report.byCategory.electricity).toBeUndefined()
  })

  it('combines both filters', () => {
    const report = buildProfitLoss(expenses, sales, { excludedCategories: ['feed'], excludedBatchKeys: ['b1'] })
    expect(report.totals).toEqual({ sales: 55000, expenses: 7000, profit: 48000 })
  })

  it('groups by month in order, after both filters', () => {
    const report = buildProfitLoss(expenses, sales, { excludedCategories: ['electricity'], excludedBatchKeys: [] })
    expect(report.byMonth).toEqual([
      { month: '2026-09', sales: 160000, expenses: 135000, profit: 25000 },
      { month: '2026-10', sales: 55000, expenses: 63000, profit: -8000 },
    ])
  })

  it('handles no data', () => {
    expect(buildProfitLoss([], [])).toEqual({
      totals: { sales: 0, expenses: 0, profit: 0 },
      byCategory: {},
      byBatch: {},
      byMonth: [],
    })
  })

  it('avoids floating-point noise in money', () => {
    const report = buildProfitLoss([expense('b1', 'other', 0.1), expense('b1', 'other', 0.2)], [sale('b1', 0.3)])
    expect(report.totals).toEqual({ sales: 0.3, expenses: 0.3, profit: 0 })
  })

  it('ignores missing or invalid amounts instead of producing NaN', () => {
    const report = buildProfitLoss([expense('b1', 'feed', Number.NaN), record('b1', '2026-09-10', { amount: 100 })], [])
    expect(report.totals.expenses).toBe(100)
    expect(report.byCategory.other).toBe(100)
  })
})
