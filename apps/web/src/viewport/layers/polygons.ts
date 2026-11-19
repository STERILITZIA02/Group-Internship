import * as T from 'three'
import type { Polygon, Transform } from '@garden/scene'
import type { ViewportPalette } from '../../editor/viewport'
import { rendering } from '../settings'

type Mesh = T.Mesh<T.CylinderGeometry, T.MeshBasicMaterial>
export function createPolygonLayer(initialPalette: ViewportPalette) {
  const root = new T.Group()
  const meshes = new Map<string, Mesh>()
  let selected: string | null = null
  let palette = initialPalette
  const { radius, thickness, groundOffset } = rendering.polygon
  function color(id: string) {
    meshes.get(id)?.material.color.set(id === selected ? palette.selected : palette.object)
  }
  function place(id: string, t: Transform) {
    const mesh = meshes.get(id)
    if (!mesh) return
    mesh.position.set(t.x, thickness / 2 + groundOffset, t.z)
    mesh.rotation.y = t.rotation
    mesh.scale.set(t.scale, 1, t.scale)
    mesh.updateMatrixWorld()
  }
  function drop(id: string) {
    const mesh = meshes.get(id)!
    root.remove(mesh)
    mesh.geometry.dispose()
    mesh.material.dispose()
    meshes.delete(id)
  }
  return {
    root,
    place,
    sync(polygons: readonly Polygon[]) {
      const ids = new Set(polygons.map((p) => p.id))
      for (const id of meshes.keys()) if (!ids.has(id)) drop(id)
      for (const p of polygons) {
        if (meshes.get(p.id)?.geometry.parameters.radialSegments !== p.sides) {
          if (meshes.has(p.id)) drop(p.id)
          const mesh = new T.Mesh(
            new T.CylinderGeometry(radius, radius, thickness, p.sides),
            new T.MeshBasicMaterial(),
          )
          mesh.userData.id = p.id
          root.add(mesh)
          meshes.set(p.id, mesh)
          color(p.id)
        }
        place(p.id, p.transform)
      }
    },
    select(id: string | null) {
      const previous = selected
      selected = id
      if (previous) color(previous)
      if (id) color(id)
    },
    pick(ray: T.Raycaster): string | null {
      return ray.intersectObjects(root.children, false)[0]?.object.userData.id ?? null
    },
    setPalette(value: ViewportPalette) {
      palette = value
      for (const id of meshes.keys()) color(id)
    },
    dispose() {
      for (const id of meshes.keys()) drop(id)
    },
  }
}
