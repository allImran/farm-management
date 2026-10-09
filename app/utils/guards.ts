/** Type guard: whether `value` is one of `values` (e.g. a valid enum value read from a URL or cookie). */
export const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (values as readonly string[]).includes(value)
