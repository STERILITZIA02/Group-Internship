<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RefreshCw, SlidersHorizontal } from '@lucide/vue'
import { sceneFormat } from '@garden/scene'
import EditorWorkspace from './components/EditorWorkspace.vue'
import FileToolbar from './components/FileToolbar.vue'
import PolygonList from './components/PolygonList.vue'
import SceneViewport from './components/SceneViewport.vue'
import TransformInspector from './components/TransformInspector.vue'
import { useEditor } from './editor/useEditor'
import { downloadScene } from './io/sceneFile'
import { useTheme } from './styles/useTheme'

const { t, n } = useI18n()
const palette = useTheme()
const { document: session, selection, selected, actions, add, remove, open } = useEditor()
const { saved, scene, draft, busy, ready, locked, error, load } = session
const status = computed(() => {
  if (busy.value) return t('sync.working')
  if (draft.value) return t('sync.unsaved')
  return ready.value ? t('sync.saved', { revision: n(saved.value.revision) }) : t('sync.offline')
})
onMounted(load)
</script>
<template>
  <EditorWorkspace :selection="selection">
    <template #header>
      <FileToolbar
        :locked="locked"
        :ready="ready"
        :has-objects="Boolean(scene.polygons.length)"
        @open="open"
        @download="downloadScene(scene)"
      />
    </template>
    <template #library>
      <PolygonList
        :polygons="scene.polygons"
        :selected="selection.id"
        :locked="locked"
        @select="actions.select"
        @add="add"
      />
    </template>
    <template #canvas>
      <SceneViewport
        :scene="scene"
        :palette="palette"
        :selected="selection.id"
        :locked="locked"
        :actions="actions"
      />
    </template>
    <template #inspector>
      <TransformInspector
        v-if="selected"
        :key="selected.id"
        :transform="selected.transform"
        :locked="locked"
        @apply="actions.move(selected.id, $event)"
        @remove="remove(selected.id)"
      />
      <section v-else class="dock-section">
        <h2><SlidersHorizontal aria-hidden="true" />{{ t('workspace.properties') }}</h2>
        <p class="selection-help">{{ t('workspace.selectObject') }}</p>
      </section>
    </template>
    <template #status>
      <div class="sync">
        <span
          aria-hidden="true"
          class="status-dot"
          :class="{ pending: busy || draft || !ready }"
        ></span
        ><span role="status">{{ status }}</span>
        <button
          class="reload"
          :disabled="busy"
          :aria-label="t('sync.reload')"
          :title="t('sync.reload')"
          @click="load"
        >
          <RefreshCw aria-hidden="true" />
        </button>
      </div>
      <p v-if="error" class="error" role="alert">
        {{ t(`errors.${error}`, { version: n(sceneFormat.schemaVersion) }) }}
        <span v-if="draft">{{ t('sync.keepEdit') }}</span>
      </p>
    </template>
  </EditorWorkspace>
</template>
