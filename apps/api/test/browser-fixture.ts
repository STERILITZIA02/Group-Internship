import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createApp } from '../src/app.ts'

const dir = await mkdtemp(join(tmpdir(), 'polygon-browser-'))
const app = createApp(join(dir, 'scene.json'))
async function close() {
  await app.close()
  await rm(dir, { recursive: true, force: true })
}
process.once('SIGTERM', close)
process.once('SIGINT', close)
await app.listen({ host: '127.0.0.1', port: 4185 })
