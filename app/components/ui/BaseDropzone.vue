<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud } from '@lucide/vue'

withDefaults(
  defineProps<{
    accept?: string
    multiple?: boolean
  }>(),
  {
    multiple: false,
  }
)

const emit = defineEmits<{
  files: [files: FileList]
}>()

const isDragging = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function openBrowser() {
  inputRef.value?.click()
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length) emit('files', files)
}

function onChange(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files && files.length) emit('files', files)
}
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors"
    :class="
      isDragging
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
        : 'border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-surface-dark-elevated'
    "
    @click="openBrowser"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300">
      <UploadCloud class="w-6 h-6" />
    </div>
    <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
      Drag and drop files here, or <span class="text-primary-600 dark:text-primary-400">browse</span>
    </p>
    <p v-if="accept" class="text-xs text-slate-400 dark:text-slate-500">{{ accept }}</p>
    <input
      ref="inputRef"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
      @change="onChange"
      @click.stop
    />
  </div>
</template>
