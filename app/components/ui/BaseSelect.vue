<script setup lang="ts">
type Option = { label: string; value: string | number }

withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    options?: Option[]
    placeholder?: string
    error?: string
    hint?: string
    optional?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    options: () => [],
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <BaseField v-slot="{ id, describedBy, controlClass }" :label="label" :error="error" :hint="hint" :optional="optional">
    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      :class="controlClass"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </BaseField>
</template>
