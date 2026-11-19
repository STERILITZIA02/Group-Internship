import * as T from 'three'
import type { ViewportPalette } from '../../editor/viewport'
import { rendering } from '../settings'

export function createGroundLayer() {
  const { extent, cellSize, texturePixels, linePixels } = rendering.grid
  const tile = document.createElement('canvas')
  tile.width = tile.height = texturePixels
  const pen = tile.getContext('2d')!
  const texture = new T.CanvasTexture(tile)
  texture.colorSpace = T.SRGBColorSpace
  texture.wrapS = texture.wrapT = T.RepeatWrapping
  texture.repeat.setScalar(extent / cellSize)
  const root = new T.Mesh(
    new T.PlaneGeometry(extent, extent),
    new T.MeshBasicMaterial({ map: texture }),
  )
  root.rotation.x = -Math.PI / 2
  const plane = new T.Plane(new T.Vector3(0, 1, 0), 0)
  const point = new T.Vector3()
  return {
    root,
    intersect(ray: T.Ray) {
      const hit = ray.intersectPlane(plane, point)
      return hit && { x: hit.x, y: hit.y, z: hit.z }
    },
    setPalette({ ground, grid }: ViewportPalette) {
      pen.fillStyle = ground
      pen.fillRect(0, 0, texturePixels, texturePixels)
      pen.fillStyle = grid
      pen.fillRect(0, 0, linePixels, texturePixels)
      pen.fillRect(0, 0, texturePixels, linePixels)
      texture.needsUpdate = true
    },
    dispose() {
      root.geometry.dispose()
      root.material.dispose()
      texture.dispose()
    },
  }
}
