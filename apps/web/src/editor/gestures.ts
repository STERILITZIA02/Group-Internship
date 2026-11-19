import { cameraControls } from './settings'
import { createCanvasTools, type CanvasToolId, type ToolGesture } from './tools'
import type { GestureSurface, ObjectActions, ScreenPoint } from './viewport'

export function bindGestures(
  canvas: HTMLCanvasElement,
  surface: GestureSurface,
  actions: ObjectActions,
  tool: () => CanvasToolId,
) {
  const tools = createCanvasTools(surface, actions)
  const pointers = new Map<number, ScreenPoint>()
  let active: ToolGesture | null = null
  function finish(commit = false) {
    active?.finish?.(commit)
    active = null
  }
  function down(e: PointerEvent) {
    if (e.button !== 0) return
    const point = { x: e.clientX, y: e.clientY }
    canvas.setPointerCapture(e.pointerId)
    pointers.set(e.pointerId, point)
    if (pointers.size === 1) active = tools[tool()].begin(point)
    else finish()
  }
  function move(e: PointerEvent) {
    const prev = pointers.get(e.pointerId)
    if (!prev) return
    const next = { x: e.clientX, y: e.clientY }
    const delta = { x: next.x - prev.x, y: next.y - prev.y }
    pointers.set(e.pointerId, next)
    if (pointers.size === 1) {
      active?.move(next, delta)
      return
    }
    if (pointers.size !== 2) return
    const other = [...pointers.entries()].find(([id]) => id !== e.pointerId)![1]
    const distance = (p: ScreenPoint) => Math.max(1, Math.hypot(p.x - other.x, p.y - other.y))
    // Only one finger moved, so the pinch midpoint travels half its delta.
    surface.panZoom(delta.x / 2, delta.y / 2, distance(prev) / distance(next))
  }
  function up(e: PointerEvent) {
    if (!pointers.delete(e.pointerId)) return
    const released = e.type === 'pointerup'
    finish(released)
    if (released && pointers.size === 1) active = tools[tool()].navigation
  }
  const events = new AbortController()
  const opts = { signal: events.signal }
  canvas.addEventListener('pointerdown', down, opts)
  canvas.addEventListener('pointermove', move, opts)
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const)
    canvas.addEventListener(type, up, opts)
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault()
      surface.zoom(Math.exp(Math.sign(e.deltaY) * cameraControls.wheelZoom))
    },
    { ...opts, passive: false },
  )
  return {
    cancel: () => finish(),
    cancelEdit() {
      if (active?.kind === 'edit') finish()
    },
    selectionChanged(id: string | null) {
      if (active?.targetId && active.targetId !== id) finish()
    },
    dispose() {
      events.abort()
      pointers.clear()
      finish()
    },
  }
}
