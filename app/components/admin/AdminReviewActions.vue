<script setup lang="ts">
import { Check, X } from '@lucide/vue'

/** Approve / reject buttons for a pending request row. */
defineEmits<{
  approve: []
  reject: []
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <BaseButton size="sm" @click="$emit('approve')">
      <template #icon-left><Check class="w-4 h-4" /></template>
      {{ $t('admin.grant.approve') }}
    </BaseButton>
    <BaseButton size="sm" variant="outline" @click="$emit('reject')">
      <template #icon-left><X class="w-4 h-4" /></template>
      {{ $t('admin.requests.reject') }}
    </BaseButton>
  </div>
</template>
