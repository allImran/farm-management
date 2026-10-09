import { describe, expect, it } from 'vitest'
import type { AppError, Result } from '~/types/network'
import { daysSince } from '~/utils/date'
import { isOneOf } from '~/utils/guards'
import { combineResults, mapResult } from '~/utils/result'

const failure: AppError = { code: 'unavailable', message: 'Down' }
const ok = <T>(data: T): Result<T> => ({ data, error: null })
const failed = <T>(): Result<T> => ({ data: null, error: failure })

describe('combineResults', () => {
  it('returns every value in order', () => {
    expect(combineResults([ok(1), ok('two'), ok(null)])).toEqual({ data: [1, 'two', null], error: null })
  })

  it('returns the first error', () => {
    expect(combineResults([ok(1), failed<string>(), ok(3)])).toEqual({ data: null, error: failure })
  })
})

describe('mapResult', () => {
  it('maps success values and passes errors through', () => {
    expect(mapResult(ok(2), (value) => value * 10)).toEqual({ data: 20, error: null })
    expect(mapResult(failed<number>(), (value) => value * 10)).toEqual({ data: null, error: failure })
  })
})

describe('isOneOf', () => {
  it('accepts only listed strings', () => {
    const statuses = ['active', 'completed'] as const
    expect(isOneOf(statuses, 'active')).toBe(true)
    expect(isOneOf(statuses, 'deleted')).toBe(false)
    expect(isOneOf(statuses, undefined)).toBe(false)
    expect(isOneOf(statuses, ['active'])).toBe(false)
  })
})

describe('daysSince', () => {
  it('counts whole days and never goes below zero', () => {
    expect(daysSince('2026-09-01', new Date(2026, 8, 11, 23, 30))).toBe(10)
    expect(daysSince('2026-09-12', new Date(2026, 8, 11))).toBe(0)
  })
})
