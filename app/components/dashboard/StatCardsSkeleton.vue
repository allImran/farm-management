<!-- Loading placeholder for a row of three `StatCard`s, laid out like the cards it stands in for. -->
<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <BaseSkeleton v-for="i in 3" :key="i" />
  </div>
</template>
