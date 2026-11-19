import type { EditRequest } from './index.ts'

/** Wire identifiers are independent of the editor's language. */
export const sceneRoutes = {
  read: '/api/scene',
  commands: '/api/scene/commands',
} as const

export function commandRequest(edit: EditRequest) {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(edit),
  }
}

export { errorMessages, SceneError, isSceneErrorCode, type SceneErrorCode } from './errors.ts'
