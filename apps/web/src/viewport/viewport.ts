import * as T from 'three'
import type { Scene, Polygon, Transform } from '@garden/scene'

type Point = { x: number; y: number }
type Hooks = {
  select(id: string | null): void
  move(id: string, t: Transform): void
  editable(): boolean
}
const origin = new T.Vector3()
const floor = new T.Plane(new T.Vector3(0, 1, 0), 0)

export function createViewport(canvas: HTMLCanvasElement, hooks: Hooks) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  const world = new T.Scene()
  world.background = new T.Color('#eeeee6')
  world.fog = new T.FogExp2('#eeeee6', 0.025)
  const grid = new T.GridHelper(120, 120, '#9ca599', '#c3c8bb')
  world.add(grid)
  const camera = new T.PerspectiveCamera(40, 1, 0.05, 400)
  let yaw = 0.65,
    tilt = 0.82,
    radius = 14
  const target = new T.Vector3()
  const meshes = new Map<string, T.Mesh<T.CylinderGeometry, T.MeshBasicMaterial>>()
  let polygons: Polygon[] = [],
    selected: string | null = null,
    frame = 0
  function draw() {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      renderer.render(world, camera)
    })
  }
  function view() {
    camera.position.setFromSphericalCoords(radius, tilt, yaw).add(target)
    camera.lookAt(target)
    camera.updateMatrixWorld()
    draw()
  }
  function zoom(factor: number) {
    radius = T.MathUtils.clamp(radius * factor, 2, 90)
    view()
  }
  function home() {
    yaw = 0.65
    tilt = 0.82
    radius = 14
    target.copy(origin)
    view()
  }
  function resize() {
    const { width, height } = canvas.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    view()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  function place(mesh: T.Mesh, t: Transform) {
    mesh.position.set(t.x, 0.065, t.z)
    mesh.rotation.y = t.rotation
    mesh.scale.set(t.scale, 1, t.scale)
    mesh.updateMatrixWorld()
  }
  function drop(id: string) {
    const mesh = meshes.get(id)!
    world.remove(mesh)
    mesh.geometry.dispose()
    mesh.material.dispose()
    meshes.delete(id)
  }
  function update(scene: Scene, selection: string | null) {
    if (polygons !== scene.polygons) cancelDrag()
    polygons = scene.polygons
    selected = selection
    const ids = new Set(polygons.map((p) => p.id))
    for (const id of meshes.keys()) if (!ids.has(id)) drop(id)
    for (const p of polygons) {
      let mesh = meshes.get(p.id)
      if (mesh && mesh.geometry.parameters.radialSegments !== p.sides) {
        drop(p.id)
        mesh = undefined
      }
      if (!mesh) {
        mesh = new T.Mesh(new T.CylinderGeometry(1, 1, 0.12, p.sides), new T.MeshBasicMaterial())
        mesh.userData.id = p.id
        meshes.set(p.id, mesh)
        world.add(mesh)
      }
      mesh.material.color.set(p.id === selected ? '#b55036' : '#617762')
      place(mesh, p.transform)
    }
    draw()
  }
  const ray = new T.Raycaster()
  function point(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    ray.setFromCamera(
      new T.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        1 - ((e.clientY - rect.top) / rect.height) * 2,
      ),
      camera,
    )
    return ray.ray.intersectPlane(floor, new T.Vector3())
  }
  const active = new Map<number, Point>()
  let drag: { polygon: Polygon; start: T.Vector3; preview: Transform } | undefined
  function cancelDrag() {
    if (drag) {
      const mesh = meshes.get(drag.polygon.id)
      if (mesh) place(mesh, drag.polygon.transform)
      drag = undefined
      draw()
    }
  }
  function down(e: PointerEvent) {
    if (e.button !== 0) return
    canvas.setPointerCapture(e.pointerId)
    active.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (active.size > 1) {
      cancelDrag()
      return
    }
    const start = point(e)
    const hit = ray.intersectObjects([...meshes.values()], false)[0]
    const p = polygons.find((p) => p.id === hit?.object.userData.id)
    hooks.select(p?.id ?? null)
    if (p && start && hooks.editable()) drag = { polygon: p, start, preview: p.transform }
  }
  function move(e: PointerEvent) {
    const prev = active.get(e.pointerId)
    if (!prev) return
    const next = { x: e.clientX, y: e.clientY }
    active.set(e.pointerId, next)
    const dx = next.x - prev.x,
      dy = next.y - prev.y
    if (active.size === 2) {
      const other = [...active.entries()].find(([id]) => id !== e.pointerId)![1]
      const distance = (p: Point) => Math.hypot(p.x - other.x, p.y - other.y)
      const units = (radius * Math.tan(T.MathUtils.degToRad(camera.fov / 2))) / canvas.clientHeight
      target.x -= (dx * Math.cos(yaw) + dy * Math.sin(yaw)) * units
      target.z += (dx * Math.sin(yaw) - dy * Math.cos(yaw)) * units
      zoom(Math.max(1, distance(prev)) / Math.max(1, distance(next)))
    } else if (active.size === 1 && drag) {
      const pos = point(e)
      if (!pos) return
      const t = drag.polygon.transform
      const snap = (v: number) => Math.round(v * 4) / 4
      drag.preview = {
        ...t,
        x: snap(t.x + pos.x - drag.start.x),
        z: snap(t.z + pos.z - drag.start.z),
      }
      place(meshes.get(drag.polygon.id)!, drag.preview)
      draw()
    } else if (active.size === 1) {
      yaw -= dx * 0.008
      tilt = T.MathUtils.clamp(tilt - dy * 0.006, 0.12, 1.35)
      view()
    }
  }
  function finish(e: PointerEvent) {
    if (!active.delete(e.pointerId)) return
    const moved = drag
    cancelDrag()
    if (
      e.type === 'pointerup' &&
      moved &&
      (moved.preview.x !== moved.polygon.transform.x ||
        moved.preview.z !== moved.polygon.transform.z)
    )
      hooks.move(moved.polygon.id, moved.preview)
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
      zoom(Math.exp(Math.sign(e.deltaY) * 0.1))
    },
    { ...opts, passive: false },
  )
  canvas.addEventListener('webglcontextrestored', draw, opts)
  resize()
  return {
    update,
    home,
    zoom,
    dispose() {
      events.abort()
      observer.disconnect()
      cancelAnimationFrame(frame)
      for (const id of meshes.keys()) drop(id)
      grid.dispose()
      renderer.dispose()
    },
  }
}
