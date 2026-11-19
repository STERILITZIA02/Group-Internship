import { onBeforeUnmount, onMounted, ref, shallowRef, watch, type Ref } from 'vue'
import type { Scene } from '@garden/scene'
import { bindGestures } from './gestures'
import { cameraControls } from './settings'
import type { EditorViewport, ObjectActions, ViewportPalette } from './viewport'
import type { CanvasToolId } from './tools'

export interface CanvasProps {
  scene: Scene
  selected: string | null
  palette: ViewportPalette
  locked: boolean
  actions: ObjectActions
}

export function useViewport(canvas: Readonly<Ref<HTMLCanvasElement | null>>, props: CanvasProps) {
  const view = shallowRef<EditorViewport>()
  const status = ref<'loading' | 'ready' | 'unavailable'>('loading')
  const tool = ref<CanvasToolId>('select')
  let input: ReturnType<typeof bindGestures> | undefined
  watch([view, () => props.scene], ([surface, scene]) => {
    input?.cancelEdit()
    surface?.setScene(scene)
  })
  watch([view, () => props.selected], ([surface, id]) => {
    input?.selectionChanged(id)
    surface?.select(id)
  })
  watch(
    () => props.palette,
    (palette) => view.value?.setPalette(palette),
  )
  watch(tool, () => input?.cancel(), { flush: 'sync' })
  watch(
    () => props.locked,
    (locked) => {
      if (locked) input?.cancelEdit()
    },
  )
  function dispose() {
    input?.dispose()
    input = undefined
    view.value?.dispose()
    view.value = undefined
  }
  onMounted(async () => {
    try {
      const { createViewport } = await import('../viewport/viewport')
      if (!canvas.value) return
      const surface = createViewport(canvas.value, props.palette)
      view.value = surface
      input = bindGestures(canvas.value, surface, props.actions, () => tool.value)
      status.value = 'ready'
    } catch {
      dispose()
      status.value = 'unavailable'
    }
  })
  onBeforeUnmount(dispose)
  return {
    tool,
    status,
    zoomIn: () => view.value?.zoom(1 / cameraControls.buttonZoom),
    zoomOut: () => view.value?.zoom(cameraControls.buttonZoom),
    reset: () => view.value?.home(),
  }
}
