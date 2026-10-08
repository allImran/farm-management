/** One include/exclude row in a profit & loss "what if" list: a batch or an expense category. */
export interface ToggleItem {
  key: string
  label: string
  /** Already formatted amount shown on the right. */
  value: string
  /** Swatch matching the item's chart color. */
  color?: string
  /** Colors the amount red (e.g. a batch that lost money). */
  isNegative?: boolean
}
