import { describe, expect, it } from 'vitest'
import { extraFarmCount, monthlyFee, needsExtraFarmConsent } from '~/utils/subscription'

const plan = { monthlyPrice: 300, extraFarmPrice: 100 }

describe('extra farm billing', () => {
  it('includes two farms in the monthly price', () => {
    expect(monthlyFee(plan, 0)).toBe(300)
    expect(monthlyFee(plan, 2)).toBe(300)
    expect(extraFarmCount(2)).toBe(0)
  })

  it('charges the extra-farm price for every farm beyond two', () => {
    expect(monthlyFee(plan, 3)).toBe(400)
    expect(monthlyFee(plan, 5)).toBe(600)
    expect(extraFarmCount(5)).toBe(3)
  })

  it('asks for consent only when the next farm would be an extra one', () => {
    expect(needsExtraFarmConsent(0, 'active', false)).toBe(false)
    expect(needsExtraFarmConsent(1, 'active', false)).toBe(false)
    expect(needsExtraFarmConsent(2, 'active', false)).toBe(true)
    expect(needsExtraFarmConsent(4, 'active', false)).toBe(true)
  })

  it('never charges free-forever users or the admin', () => {
    expect(needsExtraFarmConsent(5, 'lifetime', false)).toBe(false)
    expect(needsExtraFarmConsent(5, 'active', true)).toBe(false)
  })
})
