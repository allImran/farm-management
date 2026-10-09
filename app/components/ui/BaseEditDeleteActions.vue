<script setup lang="ts">
import { EllipsisVertical, Pencil, Trash2 } from '@lucide/vue'

/** Edit and delete actions for a list row, card or page header. */
withDefaults(
  defineProps<{
    /** Collapses both actions into a "⋮" dropdown (page headers); otherwise two icon buttons. */
    menu?: boolean
    /** Style of the "⋮" trigger; `overlay` for use on the hero gradient. */
    triggerVariant?: 'ghost' | 'overlay'
  }>(),
  {
    menu: false,
    triggerVariant: 'ghost',
  }
)

defineEmits<{
  edit: []
  delete: []
}>()
</script>

<template>
  <BaseDropdown v-if="menu" width="w-40">
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

  <div v-else class="flex items-center gap-1">
    <BaseButton variant="ghost" size="icon" :aria-label="$t('common.edit')" @click="$emit('edit')">
      <Pencil class="w-4 h-4" />
    </BaseButton>
    <BaseButton variant="ghost" size="icon" :aria-label="$t('common.delete')" @click="$emit('delete')">
      <Trash2 class="w-4 h-4 text-red-500" />
    </BaseButton>
  </div>
</template>
