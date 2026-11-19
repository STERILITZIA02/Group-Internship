import Fastify from 'fastify'
import { requestSchema } from '@garden/scene'
import { createStore, EditError } from './store.ts'

export function createApp(file: string, debug = false) {
  const app = Fastify({ logger: debug })
  const store = createStore(file)
  app.get('/api/scene', () => store.read())
  app.post('/api/scene/commands', async (request, reply) => {
    const parsed = requestSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ message: parsed.error.issues[0].message })
    const edit = parsed.data
    const log = request.log.child({ commandId: edit.commandId, operation: edit.command.type })
    try {
      const snapshot = await store.edit(edit)
      log.info({ revision: snapshot.revision }, 'Saved')
      return { ...snapshot, commandId: edit.commandId }
    } catch (err) {
      log.error({ err }, 'Edit failed')
      if (err instanceof EditError)
        return reply.code(err.status).send({ commandId: edit.commandId, message: err.message })
      return reply
        .code(500)
        .send({ commandId: edit.commandId, message: 'Could not read or save the local scene file' })
    }
  })
  return app
}
