<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: ['auth', 'admin'] })

const { t } = useI18n()

const TABS = ['requests', 'users', 'plan'] as const
const activeTab = useQueryParam<(typeof TABS)[number]>('tab', TABS, 'requests')
const tabs = computed(() => TABS.map((value) => ({ value, label: t(`admin.tabs.${value}`) })))

useSeoMeta({ title: () => t('admin.title') })
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <PageHeader :title="t('admin.title')" :description="t('admin.description')" />
    <div class="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-none">
      <BaseTabs v-model="activeTab" :tabs="tabs" class="whitespace-nowrap" />
    </div>
    <AdminRequestsPanel v-if="activeTab === 'requests'" />
    <AdminUsersPanel v-else-if="activeTab === 'users'" />
    <PlanSettingsPanel v-else />
  </div>
</template>
