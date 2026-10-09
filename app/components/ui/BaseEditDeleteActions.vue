<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'

/** Edit and delete buttons for a list row, card or page header. */
withDefaults(
  defineProps<{
    /** Shows "Edit" as a labelled button (page headers); otherwise both are icon-only. */
    labeled?: boolean
  }>(),
  {
    labeled: false,
  }
)

defineEmits<{
  edit: []
  delete: []
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <BaseButton v-if="labeled" variant="outline" @click="$emit('edit')">
      <template #icon-left><Pencil class="w-4 h-4" /></template>
      {{ $t('common.edit') }}
    </BaseButton>
    <BaseButton v-else variant="ghost" size="icon" :aria-label="$t('common.edit')" @click="$emit('edit')">
      <Pencil class="w-4 h-4" />
    </BaseButton>
    <BaseButton variant="ghost" size="icon" :aria-label="$t('common.delete')" @click="$emit('delete')">
      <Trash2 class="w-4 h-4 text-red-500" />
    </BaseButton>
  </div>
</template>
