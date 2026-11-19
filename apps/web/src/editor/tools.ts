import type { Transform } from '@garden/scene'
import type { GestureSurface, ObjectActions, ScreenPoint } from './viewport'
import { cameraControls, editing } from './settings'
import { snapCoordinate } from './transforms'

export interface ToolGesture {
  kind: 'navigation' | 'edit'
  targetId?: string
  move(point: ScreenPoint, delta: ScreenPoint): void
  finish?(commit: boolean): void
}
interface CanvasTool {
  begin(point: ScreenPoint): ToolGesture | null
  navigation: ToolGesture
}

export function createCanvasTools(surface: GestureSurface, actions: ObjectActions) {
  const orbit: ToolGesture = {
    kind: 'navigation',
    move: (_, d) =>
      surface.orbit(d.x * cameraControls.orbitHorizontal, d.y * cameraControls.orbitVertical),
  }
  const pan: ToolGesture = { kind: 'navigation', move: (_, d) => surface.panZoom(d.x, d.y, 1) }

  function select(start: ScreenPoint): ToolGesture | null {
    const { id, ground } = surface.hit(start)
    actions.select(id)
    if (id === null) return orbit
    const original = actions.movableTransform(id)
    if (!original || !ground) return null
    let preview: Transform | undefined
    return {
      kind: 'edit',
      targetId: id,
      move(point) {
        if (!preview && Math.hypot(point.x - start.x, point.y - start.y) < editing.dragThresholdPx)
          return
        const at = surface.groundAt(point)
        if (!at) return
        const x = snapCoordinate(original.x + at.x - ground.x),
          z = snapCoordinate(original.z + at.z - ground.z)
        if (x === preview?.x && z === preview.z) return
        preview = { ...original, x, z }
        surface.preview(id, preview)
      },
      finish(commit) {
        if (!preview) return
        surface.preview(id, original)
        if (commit) actions.move(id, preview)
      },
    }
  }
  return {
    select: { begin: select, navigation: orbit },
    pan: { begin: () => pan, navigation: pan },
  } satisfies Record<string, CanvasTool>
}
export type CanvasToolId = keyof ReturnType<typeof createCanvasTools>
