<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Layers, SlidersHorizontal } from '@lucide/vue'
import type { Selection } from '../editor/useEditor'

const props = defineProps<{ selection: Selection }>()
const { t } = useI18n()
const libraryId = useId(),
  inspectorId = useId()
const dock = ref<'objects' | 'properties'>('objects')
watch(
  () => props.selection,
  ({ id }) => {
    dock.value = id ? 'properties' : 'objects'
  },
)
</script>
<template>
  <div class="editor-shell">
    <slot name="header" />
    <main class="workspace" :data-dock="dock">
      <div class="dock-switch" role="group" :aria-label="t('workspace.panels')">
        <button
          :aria-controls="libraryId"
          :aria-pressed="dock === 'objects'"
          @click="dock = 'objects'"
        >
          <Layers aria-hidden="true" />{{ t('objects.heading') }}
        </button>
        <button
          :aria-controls="inspectorId"
          :aria-pressed="dock === 'properties'"
          @click="dock = 'properties'"
        >
          <SlidersHorizontal aria-hidden="true" />{{ t('workspace.properties') }}
        </button>
      </div>
      <aside :id="libraryId" class="library dock" :aria-label="t('workspace.library')">
        <slot name="library" />
      </aside>
      <slot name="canvas" />
      <aside :id="inspectorId" class="inspector dock" :aria-label="t('workspace.properties')">
        <slot name="inspector" />
      </aside>
    </main>
    <footer class="workspace-footer"><slot name="status" /></footer>
  </div>
</template>
