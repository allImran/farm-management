import { TEMP_PASSWORD_LENGTH } from '~/constants/auth'

/**
 * A fresh random one-time password of digits, from the browser's cryptographic RNG. It must never
 * be predictable: anyone can request a reset for any number, so a guessable password would let
 * them log in before the real owner does.
 */
export const generateTempPassword = (length = TEMP_PASSWORD_LENGTH) => {
  const digits: number[] = []
  while (digits.length < length) {
    // Bytes of 250+ are skipped so every digit is equally likely (250 is a multiple of 10).
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte < 250 && digits.length < length) digits.push(byte % 10)
    }
  }
  return digits.join('')
}
