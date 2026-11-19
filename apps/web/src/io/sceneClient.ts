import { snapshotSchema, type EditRequest, type Snapshot } from '@garden/scene'
import { commandRequest, isSceneErrorCode, SceneError, sceneRoutes } from '@garden/scene/protocol'

async function readResponse(response: Response): Promise<Snapshot> {
  const body = await response.json()
  if (!response.ok) {
    if (isSceneErrorCode(body?.code)) throw new SceneError(body.code)
    throw new Error('Scene service returned HTTP ' + response.status)
  }
  return snapshotSchema.parse({ revision: body.revision, scene: body.scene })
}

export const sceneClient = {
  async read() {
    return readResponse(await fetch(sceneRoutes.read, { cache: 'no-store' }))
  },
  async edit(request: EditRequest) {
    return readResponse(await fetch(sceneRoutes.commands, commandRequest(request)))
  },
}
