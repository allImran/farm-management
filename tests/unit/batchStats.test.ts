import { describe, expect, it } from 'vitest'
import { computeBatchStats, type BatchTotals } from '~/utils/batchStats'

const batch = { startDate: '2026-09-01', initialQuantity: 1000 }
const now = new Date(2026, 8, 11)
const noRecords: BatchTotals = {
  deaths: 0,
  feedKg: 0,
  expenses: 0,
  sold: { birds: 0, weightKg: 0, amount: 0 },
  latestWeightGrams: null,
}

describe('computeBatchStats', () => {
  it('counts age, mortality and birds still alive', () => {
    const stats = computeBatchStats(batch, { ...noRecords, deaths: 25, sold: { birds: 75, weightKg: 150, amount: 30000 } }, now)
    expect(stats.ageDays).toBe(10)
    expect(stats.mortality).toBe(25)
    expect(stats.mortalityRate).toBe(2.5)
    expect(stats.alive).toBe(900)
  })

  it('computes FCR from feed over sold plus live weight', () => {
    // Live weight = 150 kg sold + 900 birds × 1.5 kg = 1500 kg; 2400 kg feed / 1500 kg = 1.6.
    const stats = computeBatchStats(
      batch,
      { ...noRecords, deaths: 25, feedKg: 2400, sold: { birds: 75, weightKg: 150, amount: 0 }, latestWeightGrams: 1500 },
      now,
    )
    expect(stats.fcr).toBeCloseTo(1.6)
  })

  it('has no FCR without feed or weight data', () => {
    expect(computeBatchStats(batch, { ...noRecords, feedKg: 100 }, now).fcr).toBeNull()
    expect(computeBatchStats(batch, { ...noRecords, latestWeightGrams: 800 }, now).fcr).toBeNull()
  })

  it('takes profit as sales minus expenses', () => {
    const stats = computeBatchStats(batch, { ...noRecords, expenses: 50000, sold: { birds: 0, weightKg: 0, amount: 42000 } }, now)
    expect(stats.profit).toBe(-8000)
  })

  it('never reports negative birds or age', () => {
    const stats = computeBatchStats({ startDate: '2026-12-01', initialQuantity: 10 }, { ...noRecords, deaths: 20 }, now)
    expect(stats.alive).toBe(0)
    expect(stats.ageDays).toBe(0)
  })

  it('has a 0% mortality rate when no chicks were placed', () => {
    expect(computeBatchStats({ ...batch, initialQuantity: 0 }, noRecords, now).mortalityRate).toBe(0)
  })
})
