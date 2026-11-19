<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
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
    <h1><span class="mark" aria-hidden="true">△</span>{{ t('page.heading') }}</h1>
    <nav class="file-actions" :aria-label="t('files.label')">
      <button :disabled="locked" @click="picker?.click()">{{ t('files.open') }}</button>
      <input ref="picker" type="file" :accept="sceneFile.accept" hidden @change="picked" />
      <button :disabled="!ready" @click="emit('download')">{{ t('files.export') }}</button>
    </nav>
  </header>
</template>
