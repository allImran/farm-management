/** Anchor ids of the marketing page sections, in page order. */
export const MARKETING_SECTION_IDS = {
  technology: 'technology',
  poultry: 'poultry',
  cattle: 'cattle',
  impact: 'impact',
  howItWorks: 'how-it-works',
} as const

/** In-page navigation shown in the marketing header and footer. `labelKey` is an i18n key. */
export const MARKETING_NAV_LINKS = [
  { id: MARKETING_SECTION_IDS.technology, labelKey: 'nav.technology' },
  { id: MARKETING_SECTION_IDS.poultry, labelKey: 'nav.poultry' },
  { id: MARKETING_SECTION_IDS.cattle, labelKey: 'nav.cattle' },
  { id: MARKETING_SECTION_IDS.impact, labelKey: 'nav.impact' },
  { id: MARKETING_SECTION_IDS.howItWorks, labelKey: 'nav.howItWorks' },
] as const
