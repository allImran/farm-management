import { describe, expect, it } from 'vitest'
import { TEMP_PASSWORD_LENGTH } from '~/constants/auth'
import { generateTempPassword } from '~/utils/password'

describe('generateTempPassword', () => {
  it('returns only digits, at the configured length', () => {
    expect(generateTempPassword()).toMatch(new RegExp(`^\\d{${TEMP_PASSWORD_LENGTH}}$`))
  })

  it('is not repeated across calls', () => {
    const passwords = new Set(Array.from({ length: 200 }, () => generateTempPassword()))
    expect(passwords.size).toBe(200)
  })

  it('uses every digit', () => {
    const digits = new Set(Array.from({ length: 50 }, () => generateTempPassword()).join(''))
    expect(digits.size).toBe(10)
  })
})
