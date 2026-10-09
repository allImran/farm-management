<script setup lang="ts">
import { EllipsisVertical, Pencil, Trash2 } from '@lucide/vue'

/** Edit and delete actions for a card, table row or page header, collapsed into a "⋮" dropdown. */
withDefaults(
  defineProps<{
    /** Style of the "⋮" trigger; `overlay` for use on the hero gradient. */
    triggerVariant?: 'ghost' | 'overlay'
  }>(),
  {
    triggerVariant: 'ghost',
  }
)

defineEmits<{
  edit: []
  delete: []
}>()
</script>

<template>
  <BaseDropdown width="w-40">
    <template #trigger="{ isOpen, toggle }">
      <BaseButton
        :variant="triggerVariant"
        size="icon"
        :aria-label="$t('common.actions')"
        aria-haspopup="menu"
        :aria-expanded="isOpen"
        @click="toggle"
      >
        <EllipsisVertical class="w-5 h-5" />
      </BaseButton>
    </template>
    <BaseDropdownItem @click="$emit('edit')">
      <template #icon><Pencil class="w-4 h-4" /></template>
      {{ $t('common.edit') }}
    </BaseDropdownItem>
    <BaseDropdownItem danger @click="$emit('delete')">
      <template #icon><Trash2 class="w-4 h-4" /></template>
      {{ $t('common.delete') }}
    </BaseDropdownItem>
  </BaseDropdown>
</template>
