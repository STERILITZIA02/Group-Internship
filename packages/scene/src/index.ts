import { z } from 'zod'
import { SceneError } from './errors.ts'

const number = z.number().finite()
export const sceneFormat = { schemaVersion: 1, units: 'm', north: '-Z' } as const
export const transformSchema = z.strictObject({
  x: number,
  z: number,
  rotation: number,
  scale: number.positive(),
})
export const polygonSchema = z.strictObject({
  id: z.uuid(),
  sides: z.number().int().min(3).max(32),
  transform: transformSchema,
})
export const sceneSchema = z
  .strictObject({
    schemaVersion: z.literal(sceneFormat.schemaVersion),
    units: z.literal(sceneFormat.units),
    north: z.literal(sceneFormat.north),
    polygons: z.array(polygonSchema),
  })
  .refine(
    (scene) => new Set(scene.polygons.map((p) => p.id)).size === scene.polygons.length,
    'Polygon IDs must be unique',
  )

export const commandSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('add'), polygon: polygonSchema }),
  z.strictObject({ type: z.literal('transform'), id: z.uuid(), transform: transformSchema }),
  z.strictObject({ type: z.literal('remove'), id: z.uuid() }),
  z.strictObject({ type: z.literal('open'), scene: sceneSchema }),
])
export const snapshotSchema = z.strictObject({
  revision: z.number().int().nonnegative(),
  scene: sceneSchema,
})
export const requestSchema = z.strictObject({
  commandId: z.uuid(),
  baseRevision: snapshotSchema.shape.revision,
  command: commandSchema,
})

export type Scene = z.infer<typeof sceneSchema>
export type Transform = z.infer<typeof transformSchema>
export type Polygon = z.infer<typeof polygonSchema>
export type Command = z.infer<typeof commandSchema>
export type Snapshot = z.infer<typeof snapshotSchema>
export type EditRequest = z.infer<typeof requestSchema>

export function emptyScene(): Scene {
  return { ...sceneFormat, polygons: [] }
}

export function applyCommand(scene: Scene, command: Command): Scene {
  if (command.type === 'open') return command.scene
  if (command.type === 'add') {
    if (scene.polygons.some((p) => p.id === command.polygon.id))
      throw new SceneError('polygon_exists')
    return { ...scene, polygons: [...scene.polygons, command.polygon] }
  }
  if (!scene.polygons.some((p) => p.id === command.id)) throw new SceneError('polygon_missing')
  const polygons =
    command.type === 'remove'
      ? scene.polygons.filter((p) => p.id !== command.id)
      : scene.polygons.map((p) =>
          p.id === command.id ? { ...p, transform: command.transform } : p,
        )
  return { ...scene, polygons }
}
