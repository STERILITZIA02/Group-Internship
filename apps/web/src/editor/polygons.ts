import type { Polygon } from '@garden/scene'
import { editing } from './settings.ts'

export const polygonPresets = [
  { sides: 3, name: 'triangle' },
  { sides: 4, name: 'square' },
  { sides: 5, name: 'pentagon' },
  { sides: 6, name: 'hexagon' },
] as const

export function createPolygon(sides: number, existing: readonly Polygon[]): Polygon {
  const occupied = new Set(existing.map(({ transform: t }) => t.x + ',' + t.z))
  for (let slot = 0; ; slot++) {
    const x = (slot % editing.placementColumns) * editing.placementSpacing
    const z = Math.floor(slot / editing.placementColumns) * editing.placementSpacing
    if (!occupied.has(x + ',' + z))
      return { id: crypto.randomUUID(), sides, transform: { x, z, rotation: 0, scale: 1 } }
  }
}
