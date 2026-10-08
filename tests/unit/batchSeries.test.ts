import { describe, expect, it } from 'vitest'
import { MAX_SERIES_DAYS } from '~/constants/charts'
import type { FarmRecord } from '~/types/records'
import { buildBatchSeries } from '~/utils/batchSeries'

let nextId = 0
const record = (date: string, values: FarmRecord['values']): FarmRecord => ({
  id: String(++nextId),
  farmId: 'farm1',
  batchId: 'b1',
  date,
  values,
  createdAt: null,
})

const base = { startDate: '2026-09-01', initialQuantity: 1000, mortalities: [], feeds: [], weights: [] }

describe('buildBatchSeries', () => {
  it('puts records on the right age and fills the days between', () => {
    const series = buildBatchSeries({
      ...base,
      mortalities: [record('2026-09-02', { count: 5 }), record('2026-09-04', { count: 3 }), record('2026-09-04', { count: 2 })],
      feeds: [record('2026-09-01', { consumption: 10 }), record('2026-09-03', { consumption: 12.5 })],
      weights: [record('2026-09-04', { averageWeight: 120 })],
    })
    expect(series.days).toEqual([0, 1, 2, 3])
    expect(series.deaths).toEqual([0, 5, 0, 5])
    expect(series.cumulativeMortalityPct).toEqual([0, 0.5, 0.5, 1])
    expect(series.feedKg).toEqual([10, 0, 12.5, 0])
    expect(series.cumulativeFeedKg).toEqual([10, 10, 22.5, 22.5])
    expect(series.weightGrams).toEqual([null, null, null, 120])
  })

  it('extends the axis to today for a running batch', () => {
    const series = buildBatchSeries({ ...base, throughDay: 6, feeds: [record('2026-09-02', { consumption: 4 })] })
    expect(series.days).toHaveLength(7)
    expect(series.cumulativeFeedKg.at(-1)).toBe(4)
  })

  it('averages several weight samples on one day', () => {
    const series = buildBatchSeries({
      ...base,
      weights: [record('2026-09-03', { averageWeight: 100 }), record('2026-09-03', { averageWeight: 110 })],
    })
    expect(series.weightGrams[2]).toBe(105)
  })

  it('keeps totals right for records dated outside the batch', () => {
    const series = buildBatchSeries({
      ...base,
      mortalities: [record('2026-08-25', { count: 4 }), record('2062-09-01', { count: 6 })],
    })
    expect(series.days).toHaveLength(MAX_SERIES_DAYS + 1)
    expect(series.deaths[0]).toBe(4)
    expect(series.deaths[MAX_SERIES_DAYS]).toBe(6)
    expect(series.cumulativeMortalityPct.at(-1)).toBe(1)
  })

  it('returns a single day when there is no data', () => {
    const series = buildBatchSeries(base)
    expect(series).toEqual({
      days: [0],
      weightGrams: [null],
      deaths: [0],
      cumulativeMortalityPct: [0],
      feedKg: [0],
      cumulativeFeedKg: [0],
    })
  })

  it('never divides by zero chicks placed', () => {
    const series = buildBatchSeries({ ...base, initialQuantity: 0, mortalities: [record('2026-09-01', { count: 1 })] })
    expect(series.cumulativeMortalityPct).toEqual([0])
  })
})
