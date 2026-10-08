import type { Component } from 'vue'
import { Bird, ChartColumn, ClipboardList, Contact, Rocket, UserRound, Wallet, Warehouse } from '@lucide/vue'
import { BKASH_DIGITS_LENGTH, EXPIRY_WARNING_DAYS, INCLUDED_FARMS } from '~/constants/billing'
import { GUIDE_FAQ_ID, GUIDE_FAQ_KEYS, GUIDE_SECTIONS, type GuideSectionKey } from '~/constants/guide'
import type { GuideFaqItem } from '~/components/guide/GuideFaq.vue'
import type { GuideStep } from '~/components/guide/GuideSection.vue'
import type { GuideTocLink } from '~/components/guide/GuideToc.vue'

const SECTION_ICONS: Record<GuideSectionKey, Component> = {
  gettingStarted: Rocket,
  subscription: Wallet,
  farms: Warehouse,
  batches: Bird,
  records: ClipboardList,
  reports: ChartColumn,
  contacts: Contact,
  account: UserRound,
}

export type GuideSectionContent = {
  id: string
  icon: Component
  title: string
  intro: string
  steps: GuideStep[]
  tip?: string
}

/**
 * Translated content of the user guide, built from `GUIDE_SECTIONS` so the page, the table of
 * contents and the FAQ stay in sync. Billing numbers come from constants so the text can't
 * drift from the app's actual rules.
 * @returns Reactive `sections`, `faq` items and `tocLinks`.
 */
export const useGuideContent = () => {
  const { t } = useI18n()
  const { formatNumber } = useLocaleNumber()

  const params = computed(() => ({
    digits: formatNumber(BKASH_DIGITS_LENGTH),
    days: formatNumber(EXPIRY_WARNING_DAYS),
    included: formatNumber(INCLUDED_FARMS),
  }))

  const sections = computed<GuideSectionContent[]>(() =>
    GUIDE_SECTIONS.map((section) => {
      const base = `guide.sections.${section.key}`
      return {
        id: section.id,
        icon: SECTION_ICONS[section.key],
        title: t(`${base}.title`),
        intro: t(`${base}.intro`, params.value),
        steps: section.steps.map((step) => ({
          key: step,
          title: t(`${base}.steps.${step}.title`),
          body: t(`${base}.steps.${step}.body`, params.value),
        })),
        tip: section.hasTip ? t(`${base}.tip`, params.value) : undefined,
      }
    })
  )

  const faq = computed<GuideFaqItem[]>(() =>
    GUIDE_FAQ_KEYS.map((key) => ({
      key,
      question: t(`guide.faq.items.${key}.question`),
      answer: t(`guide.faq.items.${key}.answer`),
    }))
  )

  const tocLinks = computed<GuideTocLink[]>(() => [
    ...sections.value.map(({ id, title }) => ({ id, label: title })),
    { id: GUIDE_FAQ_ID, label: t('guide.faq.title') },
  ])

  return { sections, faq, tocLinks }
}
