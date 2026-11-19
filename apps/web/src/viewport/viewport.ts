import * as T from 'three'
import type { EditorViewport, ScreenPoint, ViewportPalette } from '../editor/viewport'
import { createGroundLayer } from './layers/ground'
import { createPolygonLayer } from './layers/polygons'
import { cameraSettings, rendering } from './settings'

export function createViewport(
  canvas: HTMLCanvasElement,
  palette: ViewportPalette,
): EditorViewport {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true })
  const world = new T.Scene()
  const background = new T.Color()
  const fog = new T.FogExp2(background, rendering.fogDensity)
  world.background = background
  world.fog = fog
  const ground = createGroundLayer(),
    polygons = createPolygonLayer(palette)
  const layers = [ground, polygons]
  for (const layer of layers) world.add(layer.root)

  const camera = new T.PerspectiveCamera(
    cameraSettings.fov,
    1,
    cameraSettings.near,
    cameraSettings.far,
  )
  const pose: { yaw: number; tilt: number; radius: number } = { ...cameraSettings.home }
  const target = new T.Vector3()
  let frame = 0
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
    renderer.setDrawingBufferSize(
      width,
      height,
      Math.min(devicePixelRatio, rendering.pixelRatioLimit),
    )
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    view()
  }
  function setPalette(value: ViewportPalette) {
    background.set(value.ground)
    fog.color.copy(background)
    for (const layer of layers) layer.setPalette(value)
    draw()
  }
  const ray = new T.Raycaster(),
    ndc = new T.Vector2()
  function cast(point: ScreenPoint) {
    const rect = canvas.getBoundingClientRect()
    ndc.set(
      ((point.x - rect.left) / rect.width) * 2 - 1,
      1 - ((point.y - rect.top) / rect.height) * 2,
    )
    ray.setFromCamera(ndc, camera)
    return ray
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  canvas.addEventListener('webglcontextrestored', draw)
  setPalette(palette)
  resize()
  return {
    zoom,
    setPalette,
    setScene(scene) {
      polygons.sync(scene.polygons)
      draw()
    },
    select(id) {
      polygons.select(id)
      draw()
    },
    preview(id, t) {
      polygons.place(id, t)
      draw()
    },
    hit(point) {
      const raycaster = cast(point)
      return { id: polygons.pick(raycaster), ground: ground.intersect(raycaster.ray) }
    },
    groundAt(point) {
      return ground.intersect(cast(point).ray)
    },
    orbit(yaw, tilt) {
      pose.yaw -= yaw
      pose.tilt = T.MathUtils.clamp(
        pose.tilt - tilt,
        cameraSettings.minTilt,
        cameraSettings.maxTilt,
      )
      view()
    },
    panZoom(dx, dy, factor) {
      // Visible world height at the orbit target, divided by the CSS viewport height.
      const units =
        (2 * pose.radius * Math.tan(T.MathUtils.degToRad(camera.fov / 2))) / canvas.clientHeight
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
      for (const layer of layers) layer.dispose()
      renderer.dispose()
    },
  }
}
