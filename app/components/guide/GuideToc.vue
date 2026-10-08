<script setup lang="ts">
export type GuideTocLink = { id: string; label: string }

defineProps<{
  title: string
  links: GuideTocLink[]
  /** Id of the section currently in view, highlighted in the list. */
  activeId?: string | null
}>()
</script>

<template>
  <nav :aria-label="title" class="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-surface-dark-elevated">
    <p class="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ title }}</p>
    <ol class="mt-2 grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-1">
      <li v-for="link in links" :key="link.id">
        <a
          :href="`#${link.id}`"
          :aria-current="activeId === link.id ? 'location' : undefined"
          class="flex min-h-10 items-center rounded-xl px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          :class="
            activeId === link.id
              ? 'bg-primary-50 text-primary-800 dark:bg-primary-500/10 dark:text-primary-300'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          "
        >
          {{ link.label }}
        </a>
      </li>
    </ol>
  </nav>
</template>
