/**
 * Locale-aware number formatting.
 *
 * `Intl` renders Bengali digits (০-৯) for `bn-BD`, so numbers in visuals follow the active
 * language without duplicating them in every translation file.
 *
 * @returns `formatNumber(value, options?)` bound to the current locale's BCP 47 tag.
 */
export const useLocaleNumber = () => {
  const { localeProperties } = useI18n()

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(localeProperties.value.language, options).format(value)

  return { formatNumber }
}
