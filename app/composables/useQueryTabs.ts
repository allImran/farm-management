import type { Tab } from '~/types/ui'
import { isOneOf } from '~/utils/guards'

/**
 * Tabs whose selection lives in the route query (`?key=value`), so it survives reloads, can be
 * shared and works with the back button.
 *
 * @param key query parameter name.
 * @param values tab values in display order; the first is the default and is kept out of the URL.
 * @param label translated label of a value.
 * @returns `active` (bind to `BaseTabs` v-model) and the `tabs` to show.
 */
export const useQueryTabs = <T extends string>(key: string, values: readonly T[], label: (value: T) => string) => {
  const route = useRoute()
  const router = useRouter()
  const fallback = values[0]!

  const active = computed<T>({
    get: () => {
      const value = route.query[key]
      return isOneOf(values, value) ? value : fallback
    },
    set: (value) => {
      router.replace({ query: { ...route.query, [key]: value === fallback ? undefined : value } })
    },
  })
  const tabs = computed<Tab<T>[]>(() => values.map((value) => ({ value, label: label(value) })))

  return { active, tabs }
}

/**
 * `useQueryTabs` for list filters: adds a leading "All" tab.
 *
 * @returns `active`, `tabs` and `selected`, the chosen value or `null` for "All".
 */
export const useQueryFilter = <T extends string>(key: string, values: readonly T[], label: (value: T) => string) => {
  const { t } = useI18n()
  const { active, tabs } = useQueryTabs<T | 'all'>(key, ['all', ...values], (value) =>
    value === 'all' ? t('common.all') : label(value),
  )
  const selected = computed(() => (active.value === 'all' ? null : active.value))
  return { active, tabs, selected }
}
