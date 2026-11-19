<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { sceneFormat, type Transform } from '@garden/scene'
import FileToolbar from './components/FileToolbar.vue'
import PolygonList from './components/PolygonList.vue'
import SceneViewport from './components/SceneViewport.vue'
import TransformInspector from './components/TransformInspector.vue'
import { useScene } from './editor/useScene'
import { createPolygon } from './editor/polygons'
import { downloadScene } from './io/sceneFile'
import { useTheme } from './styles/useTheme'

const { t, n } = useI18n()
const palette = useTheme()
const { saved, scene, draft, busy, ready, locked, error, load, edit, open } = useScene()
const selected = ref<string | null>(null)
const polygon = computed(() => scene.value.polygons.find((p) => p.id === selected.value))
const status = computed(() => {
  if (busy.value) return t('sync.working')
  if (draft.value) return t('sync.unsaved')
  return ready.value ? t('sync.saved', { revision: n(saved.value.revision) }) : t('sync.offline')
})
onMounted(load)
async function add(sides: number) {
  const polygon = createPolygon(sides, scene.value.polygons.length)
  if (await edit({ type: 'add', polygon })) selected.value = polygon.id
}
function move(id: string, transform: Transform) {
  return edit({ type: 'transform', id, transform })
}
async function remove(id: string) {
  if (await edit({ type: 'remove', id })) selected.value = null
}
async function importFile(file: File) {
  if (await open(file)) selected.value = null
}
</script>
<template>
  <FileToolbar
    :locked="locked"
    :ready="ready"
    :has-objects="Boolean(scene.polygons.length)"
    @open="importFile"
    @download="downloadScene(scene)"
  />
  <main class="workspace">
    <SceneViewport
      :scene="scene"
      :palette="palette"
      :selected="selected"
      :locked="locked"
      @select="selected = $event"
      @move="move"
    />
    <aside class="inspector">
      <PolygonList
        :polygons="scene.polygons"
        :selected="selected"
        :locked="locked"
        @select="selected = $event"
        @add="add"
      />
      <TransformInspector
        v-if="polygon"
        :key="polygon.id"
        :transform="polygon.transform"
        :locked="locked"
        @apply="move(polygon.id, $event)"
        @remove="remove(polygon.id)"
      />
      <div class="sync">
        <span role="status">{{ status }}</span>
        <button :disabled="busy" @click="load">{{ t('sync.reload') }}</button>
      </div>
      <p v-if="error" class="error" role="alert">
        {{ t(`errors.${error}`, { version: n(sceneFormat.schemaVersion) }) }}
        <span v-if="draft">{{ t('sync.keepEdit') }}</span>
      </p>
    </aside>
  </main>
</template>
