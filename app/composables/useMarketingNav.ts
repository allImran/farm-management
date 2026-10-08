import { MARKETING_NAV_LINKS, marketingSectionLink } from '~/constants/marketing'
import { ROUTES } from '~/constants/routes'

export type MarketingNavItem = {
  key: string
  label: string
  to: string | { path: string; hash: string }
}

/**
 * Links shown in the public site's header and footer: the home page sections plus the user
 * guide. Section links point at the home page so they also work from `/guide`.
 * @returns Translated, reactive list of nav items.
 */
export const useMarketingNav = () => {
  const { t } = useI18n()

  const items = computed<MarketingNavItem[]>(() => [
    ...MARKETING_NAV_LINKS.map((link) => ({ key: link.id, label: t(link.labelKey), to: marketingSectionLink(link.id) })),
    { key: 'guide', label: t('nav.guide'), to: ROUTES.guide },
  ])

  return { items }
}
