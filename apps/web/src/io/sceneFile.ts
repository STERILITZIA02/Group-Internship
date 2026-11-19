import { sceneSchema, type Scene } from '@garden/scene'

const jsonMediaType = 'application/json'
const downloadGraceMs = 1_000
export const sceneFile = { accept: '.json,' + jsonMediaType, name: 'scene.json' } as const
export async function readSceneFile(file: File) {
  return sceneSchema.parse(JSON.parse(await file.text()))
}
export function downloadScene(scene: Scene) {
  const data = new Blob([JSON.stringify(scene, null, 2) + '\n'], { type: jsonMediaType })
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = sceneFile.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), downloadGraceMs)
}
