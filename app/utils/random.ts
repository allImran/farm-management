/**
 * Deterministic pseudo-random generator (mulberry32).
 *
 * Decorative layouts must render identically on server and client to avoid hydration
 * mismatches, so they use a fixed seed instead of `Math.random()`.
 *
 * @param seed - any 32-bit integer; the same seed always yields the same sequence
 * @returns a function returning floats in [0, 1)
 */
export const createSeededRandom = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
