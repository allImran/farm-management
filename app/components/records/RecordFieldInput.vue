<script setup lang="ts">
import type { RecordFieldDef, RecordKind } from '~/types/records'

/** One form control for a record field, chosen by the field's type. */
const props = defineProps<{
  kind: RecordKind
  field: RecordFieldDef
  /** The record has no batch, so `field.farmLevelOptions` replace `field.options`. */
  isFarmLevel?: boolean
  error?: string
}>()

const value = defineModel<string>({ required: true })

const { t } = useI18n()
const { fieldLabel } = useRecordFormat()
const contactsStore = useContactsStore()
const { options: contacts } = storeToRefs(contactsStore)

const label = computed(() => {
  const base = fieldLabel(props.kind, props.field)
  return props.field.required || props.field.isDerived ? base : `${base} (${t('common.optional')})`
})

// A record's saved contact stays listed even if its type no longer matches, so editing an
// older record never silently drops it.
const allowedContacts = computed(() => {
  const types = props.field.contactTypes
  if (!types) return contacts.value
  return contacts.value.filter((contact) => contact.id === value.value || contact.types.some((type) => types.includes(type)))
})

const contactHint = computed(() => {
  const types = props.field.contactTypes
  if (!types) return undefined
  return t('records.contactFilterHint', { types: types.map((type) => t(`options.contactTypes.${type}`)).join(', ') })
})

const selectOptions = computed(() => {
  if (props.field.type === 'contact') {
    return [{ value: '', label: t('common.none') }, ...allowedContacts.value.map((contact) => ({ value: contact.id, label: contact.name }))]
  }
  const listed = (props.isFarmLevel ? props.field.farmLevelOptions : undefined) ?? props.field.options ?? []
  // Older records may hold a value this list no longer offers; keep it so editing doesn't drop it.
  const options = value.value && !listed.includes(value.value) ? [...listed, value.value] : listed
  return options.map((option) => ({ value: option, label: t(`options.${props.field.optionsKey}.${option}`) }))
})

if (props.field.type === 'contact') contactsStore.ensureLoaded()
</script>

<template>
  <BaseTextarea v-if="field.type === 'textarea'" v-model="value" :label="label" :error="error" :rows="2" />
  <BaseSelect
    v-else-if="field.type === 'select' || field.type === 'contact'"
    v-model="value"
    :label="label"
    :options="selectOptions"
    :placeholder="field.type === 'select' ? t('common.select') : undefined"
    :hint="field.type === 'contact' ? contactHint : undefined"
    :error="error"
  />
  <BaseInput
    v-else
    v-model="value"
    :label="label"
    :error="error"
    :type="field.type === 'number' || field.type === 'integer' ? 'number' : 'text'"
    :inputmode="field.type === 'integer' ? 'numeric' : field.type === 'number' ? 'decimal' : undefined"
    :step="field.type === 'number' ? 'any' : field.type === 'integer' ? 1 : undefined"
    :min="field.type === 'number' ? 0 : field.type === 'integer' ? 1 : undefined"
    :readonly="field.isDerived"
    :required="field.required"
  />
</template>
