import type { Scene, Transform } from '@garden/scene'

export type ScreenPoint = { x: number; y: number }
export type GroundPoint = { x: number; y: number; z: number }
export type ViewportPalette = { ground: string; grid: string; object: string; selected: string }

/** Geometry returned to input tools is expressed in scene metres. */
export interface GestureSurface {
  hit(point: ScreenPoint): { id: string | null; ground: GroundPoint | null }
  groundAt(point: ScreenPoint): GroundPoint | null
  preview(id: string, t: Transform): void
  panZoom(dx: number, dy: number, factor: number): void
  orbit(yaw: number, tilt: number): void
  zoom(factor: number): void
}
export interface EditorViewport extends GestureSurface {
  setScene(scene: Scene): void
  setPalette(palette: ViewportPalette): void
  select(id: string | null): void
  home(): void
  dispose(): void
}
export interface ObjectActions {
  select(id: string | null): void
  movableTransform(id: string): Transform | undefined
  move(id: string, t: Transform): void
}
