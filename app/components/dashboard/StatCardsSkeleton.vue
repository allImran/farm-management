<!-- Loading placeholder for a row of three `StatCard`s, laid out like the cards it stands in for. -->
<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
    <BaseSkeleton v-for="i in 3" :key="i" :class="{ 'col-span-2 sm:col-span-1': i === 3 }" />
  </div>
</template>
