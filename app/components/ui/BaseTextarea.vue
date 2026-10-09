<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    error?: string
    hint?: string
    optional?: boolean
    disabled?: boolean
    rows?: number
  }>(),
  {
    modelValue: '',
    rows: 4,
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <BaseField v-slot="{ id, describedBy, controlClass }" :label="label" :error="error" :hint="hint" :optional="optional">
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      class="resize-y"
      :class="controlClass"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </BaseField>
</template>
