import * as T from 'three'
import type { Scene, Transform } from '@garden/scene'
import type { ScreenPoint } from '../editor/gestures'
import { cameraSettings, rendering, type ViewportPalette } from './settings'

type PolygonMesh = T.Mesh<T.CylinderGeometry, T.MeshBasicMaterial>
const floor = new T.Plane(new T.Vector3(0, 1, 0), 0)

export function createViewport(canvas: HTMLCanvasElement, palette: ViewportPalette) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, rendering.pixelRatioLimit))
  const world = new T.Scene()
  const background = new T.Color()
  const fog = new T.FogExp2(background, rendering.fogDensity)
  world.background = background
  world.fog = fog

  const { extent, cellSize, texturePixels, linePixels } = rendering.grid
  const tile = document.createElement('canvas')
  tile.width = tile.height = texturePixels
  const pen = tile.getContext('2d')!
  const texture = new T.CanvasTexture(tile)
  texture.colorSpace = T.SRGBColorSpace
  texture.wrapS = texture.wrapT = T.RepeatWrapping
  texture.repeat.setScalar(extent / cellSize)
  const grid = new T.Mesh(
    new T.PlaneGeometry(extent, extent),
    new T.MeshBasicMaterial({ map: texture }),
  )
  grid.rotation.x = -Math.PI / 2
  world.add(grid)

  const meshes = new Map<string, PolygonMesh>()
  let selected: string | null = null
  let colors = palette
  let frame = 0
  const camera = new T.PerspectiveCamera(
    cameraSettings.fov,
    1,
    cameraSettings.near,
    cameraSettings.far,
  )
  const pose: { yaw: number; tilt: number; radius: number } = { ...cameraSettings.home }
  const target = new T.Vector3()
  function draw() {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      renderer.render(world, camera)
    })
  }
  function view() {
    camera.position.setFromSphericalCoords(pose.radius, pose.tilt, pose.yaw).add(target)
    camera.lookAt(target)
    camera.updateMatrixWorld()
    draw()
  }
  function zoom(factor: number) {
    pose.radius = T.MathUtils.clamp(
      pose.radius * factor,
      cameraSettings.minRadius,
      cameraSettings.maxRadius,
    )
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
  function setColor(id: string) {
    meshes.get(id)?.material.color.set(id === selected ? colors.selected : colors.object)
  }
  function setPalette(value: ViewportPalette) {
    colors = value
    background.set(value.ground)
    fog.color.copy(background)
    pen.fillStyle = value.ground
    pen.fillRect(0, 0, texturePixels, texturePixels)
    pen.fillStyle = value.grid
    pen.fillRect(0, 0, linePixels, texturePixels)
    pen.fillRect(0, 0, texturePixels, linePixels)
    texture.needsUpdate = true
    for (const id of meshes.keys()) setColor(id)
    draw()
  }
  function place(mesh: PolygonMesh, t: Transform) {
    mesh.position.set(t.x, rendering.polygon.thickness / 2 + rendering.polygon.groundOffset, t.z)
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
  function setScene(scene: Scene) {
    const ids = new Set(scene.polygons.map((p) => p.id))
    for (const id of meshes.keys()) if (!ids.has(id)) drop(id)
    for (const p of scene.polygons) {
      let mesh = meshes.get(p.id)
      if (mesh && mesh.geometry.parameters.radialSegments !== p.sides) {
        drop(p.id)
        mesh = undefined
      }
      if (!mesh) {
        const { radius, thickness } = rendering.polygon
        mesh = new T.Mesh(
          new T.CylinderGeometry(radius, radius, thickness, p.sides),
          new T.MeshBasicMaterial(),
        )
        mesh.userData.id = p.id
        meshes.set(p.id, mesh)
        world.add(mesh)
        setColor(p.id)
      }
      place(mesh, p.transform)
    }
    draw()
  }
  const ray = new T.Raycaster()
  function cast(point: ScreenPoint) {
    const rect = canvas.getBoundingClientRect()
    ray.setFromCamera(
      new T.Vector2(
        ((point.x - rect.left) / rect.width) * 2 - 1,
        1 - ((point.y - rect.top) / rect.height) * 2,
      ),
      camera,
    )
    return ray
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  canvas.addEventListener('webglcontextrestored', draw)
  setPalette(palette)
  resize()
  return {
    setScene,
    setPalette,
    zoom,
    select(id: string | null) {
      const previous = selected
      selected = id
      if (previous) setColor(previous)
      if (id) setColor(id)
      draw()
    },
    preview(id: string, t: Transform) {
      const mesh = meshes.get(id)
      if (mesh) {
        place(mesh, t)
        draw()
      }
    },
    pick(point: ScreenPoint): string | null {
      return (
        cast(point).intersectObjects([...meshes.values()], false)[0]?.object.userData.id ?? null
      )
    },
    groundAt(point: ScreenPoint) {
      const hit = cast(point).ray.intersectPlane(floor, new T.Vector3())
      return hit && { x: hit.x, z: hit.z }
    },
    orbit(yaw: number, tilt: number) {
      pose.yaw -= yaw
      pose.tilt = T.MathUtils.clamp(
        pose.tilt - tilt,
        cameraSettings.minTilt,
        cameraSettings.maxTilt,
      )
      view()
    },
    panZoom(dx: number, dy: number, factor: number) {
      const units =
        (pose.radius * Math.tan(T.MathUtils.degToRad(camera.fov / 2))) / canvas.clientHeight
      target.x -= (dx * Math.cos(pose.yaw) + dy * Math.sin(pose.yaw)) * units
      target.z += (dx * Math.sin(pose.yaw) - dy * Math.cos(pose.yaw)) * units
      zoom(factor)
    },
    home() {
      Object.assign(pose, cameraSettings.home)
      target.set(0, 0, 0)
      view()
    },
    dispose() {
      observer.disconnect()
      canvas.removeEventListener('webglcontextrestored', draw)
      cancelAnimationFrame(frame)
      for (const id of meshes.keys()) drop(id)
      grid.geometry.dispose()
      grid.material.dispose()
      texture.dispose()
      renderer.dispose()
    },
  }
}
