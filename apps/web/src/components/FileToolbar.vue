<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { Box, Download, FolderOpen } from '@lucide/vue'
import { sceneFile } from '../io/sceneFile'
const props = defineProps<{ locked: boolean; ready: boolean; hasObjects: boolean }>()
const emit = defineEmits<{ open: [file: File]; download: [] }>()
const { t } = useI18n()
const picker = useTemplateRef<HTMLInputElement>('picker')
function picked(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file && (!props.hasObjects || window.confirm(t('files.replace')))) emit('open', file)
}
</script>
<template>
  <header class="editor-header">
    <h1>
      <span class="mark"><Box aria-hidden="true" /></span>{{ t('page.heading') }}
    </h1>
    <nav class="file-actions" :aria-label="t('files.label')">
      <button
        :disabled="locked"
        :aria-label="t('files.open')"
        :title="t('files.open')"
        @click="picker?.click()"
      >
        <FolderOpen aria-hidden="true" /><span class="open-label">{{ t('files.open') }}</span>
      </button>
      <input ref="picker" type="file" :accept="sceneFile.accept" hidden @change="picked" />
      <button
        class="primary"
        :disabled="!ready"
        :aria-label="t('files.export')"
        :title="t('files.export')"
        @click="emit('download')"
      >
        <Download aria-hidden="true" /><span class="export-label">{{ t('files.export') }}</span>
      </button>
    </nav>
  </header>
</template>
