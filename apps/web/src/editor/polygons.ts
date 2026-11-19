import type { Polygon, Transform } from '@garden/scene'
import { editing } from './settings'

export const polygonPresets = [
  { sides: 3, name: 'triangle' },
  { sides: 4, name: 'square' },
  { sides: 5, name: 'pentagon' },
  { sides: 6, name: 'hexagon' },
] as const

export function createPolygon(sides: number, count: number): Polygon {
  return {
    id: crypto.randomUUID(),
    sides,
    transform: {
      x: (count % editing.placementColumns) * editing.placementSpacing,
      z: Math.floor(count / editing.placementColumns) * editing.placementSpacing,
      rotation: 0,
      scale: 1,
    },
  }
}

const radiansPerDegree = Math.PI / 180
export function toInspector(t: Transform) {
  return {
    x: t.x,
    z: t.z,
    degrees: Number((t.rotation / radiansPerDegree).toFixed(editing.angleDecimals)),
    scale: t.scale,
  }
}
export function fromInspector({ x, z, degrees, scale }: ReturnType<typeof toInspector>): Transform {
  return { x, z, rotation: degrees * radiansPerDegree, scale }
}

export function snapCoordinate(value: number) {
  return Math.round(value / editing.snapStep) * editing.snapStep
}
