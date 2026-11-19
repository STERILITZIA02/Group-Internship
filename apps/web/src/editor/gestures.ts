import type { Polygon, Transform } from '@garden/scene'
import { snapCoordinate } from './polygons'
import { cameraControls } from './settings'

export type ScreenPoint = { x: number; y: number }
type GroundPoint = Pick<Transform, 'x' | 'z'>

export interface GestureSurface {
  pick(point: ScreenPoint): string | null
  groundAt(point: ScreenPoint): GroundPoint | null
  preview(id: string, transform: Transform): void
  panZoom(dx: number, dy: number, factor: number): void
  orbit(dx: number, dy: number): void
  zoom(factor: number): void
}

interface EditorActions {
  select(id: string | null): void
  polygon(id: string): Polygon | undefined
  move(id: string, transform: Transform): void
  editable(): boolean
}

export function bindGestures(
  canvas: HTMLCanvasElement,
  surface: GestureSurface,
  actions: EditorActions,
) {
  const pointers = new Map<number, ScreenPoint>()
  let drag: { polygon: Polygon; start: GroundPoint; preview: Transform } | undefined

  function cancelDrag() {
    if (!drag) return
    surface.preview(drag.polygon.id, drag.polygon.transform)
    drag = undefined
  }

  function down(e: PointerEvent) {
    if (e.button !== 0) return
    canvas.setPointerCapture(e.pointerId)
    const point = { x: e.clientX, y: e.clientY }
    pointers.set(e.pointerId, point)
    if (pointers.size > 1) {
      cancelDrag()
      return
    }
    const id = surface.pick(point)
    actions.select(id)
    if (!id || !actions.editable()) return
    const polygon = actions.polygon(id)
    const start = surface.groundAt(point)
    if (polygon && start) drag = { polygon, start, preview: polygon.transform }
  }

  function move(e: PointerEvent) {
    const prev = pointers.get(e.pointerId)
    if (!prev) return
    const next = { x: e.clientX, y: e.clientY }
    pointers.set(e.pointerId, next)
    const dx = next.x - prev.x,
      dy = next.y - prev.y
    if (pointers.size === 2) {
      const other = [...pointers.entries()].find(([id]) => id !== e.pointerId)![1]
      const distance = (point: ScreenPoint) =>
        Math.max(1, Math.hypot(point.x - other.x, point.y - other.y))
      surface.panZoom(dx, dy, distance(prev) / distance(next))
      return
    }
    if (pointers.size !== 1) return
    if (!drag) {
      surface.orbit(dx * cameraControls.orbitHorizontal, dy * cameraControls.orbitVertical)
      return
    }
    const point = surface.groundAt(next)
    if (!point) return
    const t = drag.polygon.transform
    drag.preview = {
      ...t,
      x: snapCoordinate(t.x + point.x - drag.start.x),
      z: snapCoordinate(t.z + point.z - drag.start.z),
    }
    surface.preview(drag.polygon.id, drag.preview)
  }

  function finish(e: PointerEvent) {
    if (!pointers.delete(e.pointerId)) return
    const moved = drag
    cancelDrag()
    if (!moved || e.type !== 'pointerup') return
    const { polygon, preview } = moved
    if (preview.x !== polygon.transform.x || preview.z !== polygon.transform.z)
      actions.move(polygon.id, preview)
  }
  const events = new AbortController()
  const opts = { signal: events.signal }
  canvas.addEventListener('pointerdown', down, opts)
  canvas.addEventListener('pointermove', move, opts)
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const)
    canvas.addEventListener(type, finish, opts)
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      surface.zoom(Math.exp(Math.sign(e.deltaY) * cameraControls.wheelZoom))
    },
    { ...opts, passive: false },
  )
  return {
    cancelDrag,
    dispose() {
      events.abort()
      pointers.clear()
      cancelDrag()
    },
  }
}
