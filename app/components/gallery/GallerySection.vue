<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    title: string
    description?: string
  }>(),
  {}
)
</script>

<template>
  <section :id="id" class="scroll-mt-24">
    <div class="mb-4">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ title }}</h2>
      <p v-if="description" class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ description }}</p>
    </div>
    <BaseCard>
      <div class="space-y-6">
        <slot />
      </div>
    </BaseCard>
  </section>
</template>
