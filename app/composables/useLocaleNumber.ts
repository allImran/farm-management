/**
 * Locale-aware number formatting.
 *
 * `Intl` renders Bengali digits (০-৯) for `bn-BD`, so numbers in visuals follow the active
 * language without duplicating them in every translation file.
 *
 * @returns `formatNumber(value, options?)` bound to the current locale's BCP 47 tag, and
 *          `formatMoney(value)` for Taka amounts (`৳` prefix, up to 2 decimals).
 */
export const useLocaleNumber = () => {
  const { localeProperties } = useI18n()

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(localeProperties.value.language, options).format(value)

  // A fixed `৳` prefix reads the same in both languages; Intl's BDT currency style doesn't.
  // The sign goes before the symbol (-৳500), not between symbol and digits (৳-500).
  const formatMoney = (value: number) =>
    `${value < 0 ? '-' : ''}৳${formatNumber(Math.abs(value), { maximumFractionDigits: 2 })}`

  return { formatNumber, formatMoney }
}
