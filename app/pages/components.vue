<script setup lang="ts">
import {
  Search,
  Mail,
  Lock,
  Bird,
  Egg,
  Wheat,
  Skull,
  UploadCloud,
  Inbox,
  Plus,
} from '@lucide/vue'

const { monthlyRevenue, feedConsumption, productionMix, orders, heatmapData } = useMockData()

const sections = [
  { id: 'buttons', label: 'Buttons' },
  { id: 'badges', label: 'Badges' },
  { id: 'cards', label: 'Cards & Stats' },
  { id: 'forms', label: 'Form Controls' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'data-display', label: 'Data Display' },
  { id: 'charts', label: 'Charts' },
]

const textValue = ref('')
const selectValue = ref('option-1')
const textareaValue = ref('')
const checkboxValue = ref(true)
const toggleValue = ref(true)
const radioValue = ref('a')
const progressValue = ref(64)
const currentPage = ref(3)
const activeTab = ref('overview')
const modalOpen = ref(false)
const drawerOpen = ref(false)
const alertVisible = ref(true)

const selectOptions = [
  { label: 'Option One', value: 'option-1' },
  { label: 'Option Two', value: 'option-2' },
  { label: 'Option Three', value: 'option-3' },
]

const dropdownItems = [
  { label: 'Edit Flock', value: 'edit' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Archive', value: 'archive' },
  { label: 'Delete', value: 'delete', disabled: false },
]

const orderColumns = [
  { key: 'id', label: 'Order' },
  { key: 'customer', label: 'Customer' },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status' },
]

const statusTone: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  Delivered: 'green',
  Processing: 'blue',
  Pending: 'yellow',
  Cancelled: 'red',
}

const barLabels = monthlyRevenue.map((m) => m.label)
const barDatasets = [{ label: 'Revenue', data: monthlyRevenue.map((m) => m.value) }]
const lineLabels = feedConsumption.map((f) => f.label)
const lineDatasets = [{ label: 'Feed (kg)', data: feedConsumption.map((f) => f.value) }]

function onFilesDropped(files: FileList) {
  console.log('files received', files)
}
</script>

<template>
  <AppShell>
    <div class="max-w-[1600px] mx-auto flex gap-8">
      <aside class="hidden lg:block w-56 shrink-0">
        <div class="sticky top-24 space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 px-3 mb-2">Component Gallery</p>
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="block px-3 py-2 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {{ section.label }}
          </a>
        </div>
      </aside>

      <div class="flex-1 min-w-0 space-y-10">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Design System</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">
            Every reusable component available for building the Broiler Management admin panel.
          </p>
        </div>

        <GallerySection id="buttons" title="Buttons" description="Primary actions, variants and states">
          <GalleryRow label="Variants">
            <BaseButton variant="primary">Primary</BaseButton>
            <BaseButton variant="secondary">Secondary</BaseButton>
            <BaseButton variant="outline">Outline</BaseButton>
            <BaseButton variant="ghost">Ghost</BaseButton>
            <BaseButton variant="danger">Danger</BaseButton>
            <BaseButton variant="dark">Dark</BaseButton>
          </GalleryRow>
          <GalleryRow label="Sizes">
            <BaseButton size="sm">Small</BaseButton>
            <BaseButton size="md">Medium</BaseButton>
            <BaseButton size="lg">Large</BaseButton>
            <BaseButton size="icon" aria-label="Add"><Plus class="w-4 h-4" /></BaseButton>
          </GalleryRow>
          <GalleryRow label="States">
            <BaseButton loading>Loading</BaseButton>
            <BaseButton disabled>Disabled</BaseButton>
            <BaseButton :pill="false">Square Corners</BaseButton>
          </GalleryRow>
        </GallerySection>

        <GallerySection id="badges" title="Badges" description="Status pills and trend indicators">
          <GalleryRow label="Tones">
            <BaseBadge tone="yellow">Yellow</BaseBadge>
            <BaseBadge tone="blue">Blue</BaseBadge>
            <BaseBadge tone="green">Green</BaseBadge>
            <BaseBadge tone="purple">Purple</BaseBadge>
            <BaseBadge tone="red">Red</BaseBadge>
            <BaseBadge tone="slate">Slate</BaseBadge>
          </GalleryRow>
          <GalleryRow label="With trend">
            <BaseBadge tone="green" trend="up">+23%</BaseBadge>
            <BaseBadge tone="blue" trend="down">-3%</BaseBadge>
          </GalleryRow>
          <GalleryRow label="Progress bars">
            <div class="w-full max-w-sm space-y-3">
              <BaseProgressBar :value="progressValue" tone="yellow" show-label />
              <BaseProgressBar :value="82" tone="green" show-label />
              <BaseProgressBar :value="34" tone="red" show-label />
            </div>
          </GalleryRow>
        </GallerySection>

        <GallerySection id="cards" title="Cards & Stat Widgets" description="KPI cards used across the dashboard">
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Birds" value="69,400" :icon="Bird" tone="yellow" trend="up" trend-value="+8.2%" />
            <StatCard label="Mortality Rate" value="2.4%" :icon="Skull" tone="red" trend="down" trend-value="-0.6%" />
            <StatCard label="Feed Used" value="18.2t" :icon="Wheat" tone="green" trend="up" trend-value="+3.1%" />
            <StatCard label="Egg Production" value="52,340" :icon="Egg" tone="blue" trend="up" trend-value="+15%" />
          </div>
          <GalleryRow label="Avatars">
            <BaseAvatar name="Arafat Rahman" size="xs" />
            <BaseAvatar name="Mainul Islam" size="sm" status="online" />
            <BaseAvatar name="Alia Marsh" size="md" status="busy" />
            <BaseAvatar name="Solvex Admin" size="lg" status="offline" />
            <BaseAvatar name="Farm Owner" size="xl" />
          </GalleryRow>
        </GallerySection>

        <GallerySection id="forms" title="Form Controls" description="Inputs, selects and toggles">
          <div class="grid sm:grid-cols-2 gap-6">
            <BaseInput v-model="textValue" label="Farm Name" placeholder="e.g. Green Valley Farms">
              <template #icon-left><Search class="w-4 h-4" /></template>
            </BaseInput>
            <BaseInput label="Email" type="email" placeholder="you@farm.com">
              <template #icon-left><Mail class="w-4 h-4" /></template>
            </BaseInput>
            <BaseInput label="Password" type="password" placeholder="••••••••">
              <template #icon-left><Lock class="w-4 h-4" /></template>
            </BaseInput>
            <BaseInput label="With Error" model-value="invalid" error="This field is required" />
            <BaseSelect v-model="selectValue" label="House Sector" :options="selectOptions" />
            <BaseTextarea v-model="textareaValue" label="Notes" placeholder="Additional notes..." />
          </div>
          <GalleryRow label="Checkbox / Toggle / Radio">
            <BaseCheckbox v-model="checkboxValue">Enable notifications</BaseCheckbox>
            <BaseToggle v-model="toggleValue">Auto feeding</BaseToggle>
            <BaseRadio v-model="radioValue" value="a">Option A</BaseRadio>
            <BaseRadio v-model="radioValue" value="b">Option B</BaseRadio>
          </GalleryRow>
          <GalleryRow label="Dropzone">
            <div class="w-full max-w-md">
              <BaseDropzone accept="image/*" @files="onFilesDropped" />
            </div>
          </GalleryRow>
        </GallerySection>

        <GallerySection id="feedback" title="Feedback" description="Alerts, empty states and loaders">
          <div class="space-y-3">
            <BaseAlert variant="info" title="Heads up">New feed formulation available for Batch C-301.</BaseAlert>
            <BaseAlert variant="success" title="Saved">Flock record updated successfully.</BaseAlert>
            <BaseAlert variant="warning" title="Attention needed">Mortality rate above threshold in House 4.</BaseAlert>
            <BaseAlert
              v-if="alertVisible"
              variant="error"
              title="Sync failed"
              dismissible
              @dismiss="alertVisible = false"
            >
              Could not sync sensor data. Retry connection.
            </BaseAlert>
          </div>
          <GalleryRow label="Spinners & Skeletons">
            <BaseSpinner size="sm" />
            <BaseSpinner size="md" />
            <BaseSpinner size="lg" />
            <BaseSkeleton variant="circle" width="2.5rem" height="2.5rem" />
            <BaseSkeleton variant="text" width="8rem" />
            <BaseSkeleton variant="rect" width="6rem" height="3rem" />
          </GalleryRow>
          <GalleryRow label="Empty state">
            <div class="w-full">
              <BaseEmptyState title="No orders yet" description="Orders will appear here once customers start purchasing.">
                <template #icon><Inbox class="w-10 h-10" /></template>
                <template #action><BaseButton size="sm">Create Order</BaseButton></template>
              </BaseEmptyState>
            </div>
          </GalleryRow>
        </GallerySection>

        <GallerySection id="overlays" title="Overlays" description="Modals, drawers, dropdowns and tooltips">
          <GalleryRow label="Modal & Drawer">
            <BaseButton @click="modalOpen = true">Open Modal</BaseButton>
            <BaseButton variant="outline" @click="drawerOpen = true">Open Drawer</BaseButton>
            <BaseModal v-model="modalOpen" title="Add New Flock Batch">
              <p class="text-sm text-slate-500 dark:text-slate-400">
                This is a modal dialog used for quick create/edit forms across the admin panel.
              </p>
              <template #footer>
                <BaseButton variant="ghost" @click="modalOpen = false">Cancel</BaseButton>
                <BaseButton @click="modalOpen = false">Save</BaseButton>
              </template>
            </BaseModal>
            <BaseDrawer v-model="drawerOpen" title="Flock Details" side="right">
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Slide-in panel useful for detail views without leaving the current page context.
              </p>
              <template #footer>
                <BaseButton variant="ghost" @click="drawerOpen = false">Close</BaseButton>
              </template>
            </BaseDrawer>
          </GalleryRow>
          <GalleryRow label="Dropdown">
            <BaseDropdown :items="dropdownItems" @select="(v) => console.log(v)">
              <BaseButton variant="outline">Actions</BaseButton>
            </BaseDropdown>
          </GalleryRow>
          <GalleryRow label="Tooltip">
            <BaseTooltip text="Shows total revenue this month">
              <BaseButton variant="ghost">Hover me</BaseButton>
            </BaseTooltip>
          </GalleryRow>
        </GallerySection>

        <GallerySection id="navigation" title="Navigation" description="Tabs and pagination">
          <GalleryRow label="Tabs">
            <BaseTabs
              v-model="activeTab"
              :tabs="[
                { label: 'Overview', value: 'overview' },
                { label: 'Flocks', value: 'flocks' },
                { label: 'Reports', value: 'reports' },
              ]"
            />
          </GalleryRow>
          <GalleryRow label="Pagination">
            <BasePagination v-model:current-page="currentPage" :total-pages="12" />
          </GalleryRow>
        </GallerySection>

        <GallerySection id="data-display" title="Data Display" description="Tables for structured records">
          <BaseTable :columns="orderColumns" :rows="orders.slice(0, 4)">
            <template #cell-amount="{ row }">
              <span class="font-semibold">${{ (row.amount as number).toLocaleString() }}</span>
            </template>
            <template #cell-status="{ row }">
              <BaseBadge :tone="statusTone[row.status as string]" size="sm">{{ row.status }}</BaseBadge>
            </template>
          </BaseTable>
          <GalleryRow label="Loading state">
            <div class="w-full">
              <BaseTable :columns="orderColumns" :rows="[]" loading />
            </div>
          </GalleryRow>
        </GallerySection>

        <GallerySection id="charts" title="Charts" description="Chart.js powered visualizations">
          <div class="grid xl:grid-cols-2 gap-6">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Bar Chart</p>
              <BarChart :labels="barLabels" :datasets="barDatasets" value-prefix="$" height="16rem" />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Line Chart (filled)</p>
              <LineChart :labels="lineLabels" :datasets="lineDatasets" filled height="16rem" />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Area Chart</p>
              <AreaChart :labels="lineLabels" :datasets="lineDatasets" height="16rem" />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Donut Chart</p>
              <DonutChart :data="productionMix" center-label="Weekly Flow" height="14rem" />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Pie Chart</p>
              <PieChart :data="productionMix" height="14rem" />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Radial Progress</p>
              <div class="flex gap-6 items-center">
                <RadialProgressChart :value="72" label="Feed Efficiency" color="#f5b700" height="9rem" />
                <RadialProgressChart :value="24" label="Mortality" color="#ef4444" height="9rem" />
                <RadialProgressChart :value="91" label="Vaccination" color="#22c55e" height="9rem" />
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Sparkline</p>
              <div class="space-y-4">
                <div class="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span class="text-sm font-semibold">Egg Production</span>
                  <SparklineChart :data="[12, 19, 14, 22, 18, 27, 24, 31]" color="#22c55e" filled />
                </div>
                <div class="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span class="text-sm font-semibold">Mortality Trend</span>
                  <SparklineChart :data="[8, 6, 9, 5, 7, 4, 6, 3]" color="#ef4444" />
                </div>
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Heatmap Calendar</p>
              <HeatmapCalendar :data="heatmapData" :weeks="12" />
            </div>
          </div>
        </GallerySection>
      </div>
    </div>
  </AppShell>
</template>
