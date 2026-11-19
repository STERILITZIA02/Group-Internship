import Fastify from 'fastify'
import { requestSchema } from '@garden/scene'
import { errorMessages, SceneError, sceneRoutes, type SceneErrorCode } from '@garden/scene/protocol'
import { createStore } from './store.ts'

const statusFor = {
  invalid_request: 400,
  revision_conflict: 409,
  polygon_exists: 422,
  polygon_missing: 422,
  storage_error: 500,
} satisfies Record<SceneErrorCode, number>

export function createApp(file: string, debug = false) {
  const app = Fastify({ logger: debug })
  const store = createStore(file)
  app.get(sceneRoutes.read, async (request, reply) => {
    try {
      return await store.read()
    } catch (err) {
      request.log.error({ err }, 'Read failed')
      return reply
        .code(statusFor.storage_error)
        .send({ code: 'storage_error', message: errorMessages.storage_error })
    }
  })
  app.post(sceneRoutes.commands, async (request, reply) => {
    const parsed = requestSchema.safeParse(request.body)
    if (!parsed.success)
      return reply
        .code(statusFor.invalid_request)
        .send({ code: 'invalid_request', message: parsed.error.issues[0].message })
    const edit = parsed.data
    const log = request.log.child({ commandId: edit.commandId, operation: edit.command.type })
    try {
      const snapshot = await store.edit(edit)
      log.info({ revision: snapshot.revision }, 'Saved')
      return { ...snapshot, commandId: edit.commandId }
    } catch (err) {
      log.error({ err }, 'Edit failed')
      const code = err instanceof SceneError ? err.code : 'storage_error'
      return reply
        .code(statusFor[code])
        .send({ commandId: edit.commandId, code, message: errorMessages[code] })
    }
  })
  return app
}
