<script setup lang="ts">
import { MapPin, Pencil, Phone, Trash2 } from '@lucide/vue'
import type { Contact } from '~/types/models'

defineProps<{
  contact: Contact
}>()

defineEmits<{
  edit: []
  delete: []
}>()

const { t } = useI18n()
</script>

<template>
  <BaseCard :padded="false" class="p-4 h-full">
    <div class="flex items-start gap-3">
      <BaseAvatar :name="contact.name" />
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-slate-900 dark:text-white truncate">{{ contact.name }}</h3>
        <div v-if="contact.types.length" class="mt-1 flex flex-wrap gap-1">
          <BaseBadge v-for="type in contact.types" :key="type" size="sm" tone="blue">{{ t(`options.contactTypes.${type}`) }}</BaseBadge>
        </div>
      </div>
      <div class="flex items-center -mr-2 -mt-1">
        <BaseButton variant="ghost" size="icon" :aria-label="t('common.edit')" @click="$emit('edit')"><Pencil class="w-4 h-4" /></BaseButton>
        <BaseButton variant="ghost" size="icon" :aria-label="t('common.delete')" @click="$emit('delete')"><Trash2 class="w-4 h-4 text-red-500" /></BaseButton>
      </div>
    </div>
    <div class="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
      <a v-if="contact.phone" :href="`tel:${contact.phone}`" class="flex items-center gap-2 hover:text-primary-700 dark:hover:text-primary-400">
        <Phone class="w-4 h-4 text-slate-400" /> {{ contact.phone }}
      </a>
      <p v-if="contact.address" class="flex items-start gap-2"><MapPin class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" /> {{ contact.address }}</p>
      <p v-if="contact.notes" class="text-slate-500 dark:text-slate-400 whitespace-pre-line">{{ contact.notes }}</p>
    </div>
  </BaseCard>
</template>
