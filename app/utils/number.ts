/** The value if it is a finite number, else 0 (record fields can be missing or malformed). */
export const toFiniteNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

/** Rounds to `digits` decimals, e.g. `round(0.1 + 0.2, 2)` → 0.3. */
export const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits
