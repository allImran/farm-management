<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: ['auth', 'admin'] })

const { t } = useI18n()

const ADMIN_TABS = ['requests', 'resets', 'users', 'plan'] as const
const { active: activeTab, tabs } = useQueryTabs('tab', ADMIN_TABS, (value) => t(`admin.tabs.${value}`))

useSeoMeta({ title: () => t('admin.title') })
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <PageHeader :title="t('admin.title')" :description="t('admin.description')" />
    <BaseTabs v-model="activeTab" :tabs="tabs" class="mb-6" />
    <BaseTabPanel :active="activeTab">
      <AdminRequestsPanel v-if="activeTab === 'requests'" />
      <AdminPasswordResetsPanel v-else-if="activeTab === 'resets'" />
      <AdminUsersPanel v-else-if="activeTab === 'users'" />
      <PlanSettingsPanel v-else />
    </BaseTabPanel>
  </div>
</template>
