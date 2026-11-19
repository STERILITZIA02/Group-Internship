/** Wire identifiers are independent of the editor's language. */
export const sceneRoutes = {
  read: '/api/scene',
  commands: '/api/scene/commands',
} as const

export const errorMessages = {
  invalid_request: 'Invalid edit request',
  revision_conflict: 'Scene changed. Reload the current version.',
  polygon_exists: 'Polygon ID already exists',
  polygon_missing: 'Polygon no longer exists',
  storage_error: 'Could not read or save the local scene file',
} as const
export type SceneErrorCode = keyof typeof errorMessages

export class SceneError extends Error {
  readonly code: SceneErrorCode
  constructor(code: SceneErrorCode) {
    super(errorMessages[code])
    this.code = code
  }
}
export function isSceneErrorCode(value: unknown): value is SceneErrorCode {
  return typeof value === 'string' && Object.hasOwn(errorMessages, value)
}
