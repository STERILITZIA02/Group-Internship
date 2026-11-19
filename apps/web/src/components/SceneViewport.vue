<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Scene, Transform } from '@garden/scene'
import { bindGestures } from '../editor/gestures'
import { cameraControls } from '../editor/settings'
import type { ViewportPalette } from '../viewport/settings'
import type { createViewport } from '../viewport/viewport'

const props = defineProps<{
  scene: Scene
  selected: string | null
  locked: boolean
  palette: ViewportPalette
}>()
const emit = defineEmits<{
  select: [id: string | null]
  move: [id: string, transform: Transform]
}>()
const { t } = useI18n()
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const view = shallowRef<ReturnType<typeof createViewport>>()
let input: ReturnType<typeof bindGestures> | undefined
const status = ref<'loading' | 'ready' | 'unavailable'>('loading')
watch(
  () => props.scene,
  (scene) => {
    input?.cancelDrag()
    view.value?.setScene(scene)
  },
)
watch(
  () => props.selected,
  (id) => view.value?.select(id),
)
watch(
  () => props.palette,
  (palette) => view.value?.setPalette(palette),
)
onMounted(async () => {
  try {
    const { createViewport } = await import('../viewport/viewport')
    if (!canvas.value) return
    const surface = createViewport(canvas.value, props.palette)
    view.value = surface
    surface.setScene(props.scene)
    surface.select(props.selected)
    input = bindGestures(canvas.value, surface, {
      select: (id) => emit('select', id),
      polygon: (id) => props.scene.polygons.find((p) => p.id === id),
      move: (id, t) => emit('move', id, t),
      editable: () => !props.locked,
    })
    status.value = 'ready'
  } catch {
    status.value = 'unavailable'
  }
})
onBeforeUnmount(() => {
  input?.dispose()
  view.value?.dispose()
})
</script>
<template>
  <section class="stage" :aria-label="t('viewport.label')">
    <canvas ref="canvas" :aria-label="t('viewport.canvas')"></canvas>
    <p v-if="status !== 'ready'" class="gpu" role="status">{{ t(`viewport.${status}`) }}</p>
    <div v-else class="view-tools" role="group" :aria-label="t('viewport.camera')">
      <button
        :title="t('viewport.zoomOut')"
        :aria-label="t('viewport.zoomOut')"
        @click="view?.zoom(cameraControls.buttonZoom)"
      >
        −
      </button>
      <button
        :title="t('viewport.zoomIn')"
        :aria-label="t('viewport.zoomIn')"
        @click="view?.zoom(1 / cameraControls.buttonZoom)"
      >
        +
      </button>
      <button @click="view?.home()">{{ t('viewport.reset') }}</button>
    </div>
  </section>
</template>
