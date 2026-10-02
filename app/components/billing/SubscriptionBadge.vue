<script setup lang="ts">
import type { Subscription } from '~/types/models'

/** Coloured pill with the subscription state, e.g. "Active until 3 Nov 2026". */
const props = defineProps<{
  subscription: Subscription | null
}>()

const { describe } = useSubscriptionLabel()
const info = computed(() => describe(props.subscription))
</script>

<template>
  <BaseBadge :tone="info.tone">{{ info.label }}</BaseBadge>
</template>
