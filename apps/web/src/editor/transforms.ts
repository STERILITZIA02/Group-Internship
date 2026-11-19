import type { Transform } from '@garden/scene'
import { editing } from './settings.ts'

const radiansPerDegree = Math.PI / 180
function displayDegrees(radians: number) {
  return Number((radians / radiansPerDegree).toFixed(editing.angleDecimals))
}
export function toInspector(t: Transform) {
  return { x: t.x, z: t.z, degrees: displayDegrees(t.rotation), scale: t.scale }
}
export function fromInspector(
  { x, z, degrees, scale }: ReturnType<typeof toInspector>,
  original: Transform,
): Transform {
  return {
    x,
    z,
    rotation:
      degrees === displayDegrees(original.rotation)
        ? original.rotation
        : degrees * radiansPerDegree,
    scale,
  }
}
export function snapCoordinate(value: number) {
  return Math.round(value / editing.snapStep) * editing.snapStep
}

export function sameTransform(a: Transform, b: Transform) {
  return a.x === b.x && a.z === b.z && a.rotation === b.rotation && a.scale === b.scale
}
