import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { emptyScene, sceneSchema } from '@garden/scene'
import type { Command } from '@garden/scene'
import { createApp } from '../src/app.ts'

const polygon = {
  id: crypto.randomUUID(),
  sides: 3,
  transform: { x: 1, z: 2, rotation: 0, scale: 1 },
}
const request = (baseRevision: number, command: Command) => ({
  commandId: crypto.randomUUID(),
  baseRevision,
  command,
})
test('disk saves survive restart, competing revisions and invalid imports', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'polygon-test-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const file = join(dir, 'scene.json')
  const app = createApp(file)
  t.after(() => app.close())
  const edit = (payload: unknown) =>
    app.inject({
      method: 'POST',
      url: '/api/scene/commands',
      payload: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
    })
  assert.deepEqual((await app.inject('/api/scene')).json(), { revision: 0, scene: emptyScene() })
  const added = await edit(request(0, { type: 'add', polygon }))
  assert.equal(added.statusCode, 200)
  const update = {
    type: 'transform' as const,
    id: polygon.id,
    transform: { ...polygon.transform, x: 3 },
  }
  const writes = await Promise.all([edit(request(1, update)), edit(request(1, update))])
  assert.deepEqual(writes.map((r) => r.statusCode).sort(), [200, 409])
  const bytes = await readFile(file, 'utf8')
  const reopened = createApp(file)
  t.after(() => reopened.close())
  const saved = (await reopened.inject('/api/scene')).json()
  assert.equal(saved.revision, 2)
  assert.deepEqual(saved.scene.polygons, [{ ...polygon, transform: update.transform }])
  assert.equal(
    (
      await edit(
        request(2, { type: 'open', scene: { ...emptyScene(), polygons: [polygon, polygon] } }),
      )
    ).statusCode,
    400,
  )
  assert.equal(
    (await edit(request(2, { type: 'remove', id: crypto.randomUUID() }))).statusCode,
    422,
  )
  assert.equal(await readFile(file, 'utf8'), bytes)
  await writeFile(file, 'unreadable')
  assert.equal((await edit(request(2, update))).statusCode, 500)
  assert.equal(await readFile(file, 'utf8'), 'unreadable')
})

test('stdio MCP and HTTP see the same revision, edit and conflict', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'polygon-mcp-'))
  const app = createApp(join(dir, 'scene.json'))
  const address = await app.listen({ host: '127.0.0.1', port: 0 })
  const client = new Client({ name: 'scene-check', version: '1' })
  t.after(async () => {
    await client.close()
    await app.close()
    await rm(dir, { recursive: true, force: true })
  })
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [fileURLToPath(new URL('../src/mcp.ts', import.meta.url))],
      env: { SCENE_API_PORT: new URL(address).port },
    }),
  )
  assert.deepEqual((await client.listTools()).tools.map((x) => x.name).sort(), [
    'apply_command',
    'get_scene',
  ])
  const args = request(0, { type: 'add', polygon })
  const result = await client.callTool({ name: 'apply_command', arguments: args })
  assert.equal(result.isError, false)
  const snapshot = (await app.inject('/api/scene')).json()
  assert.deepEqual(sceneSchema.parse(snapshot.scene).polygons, [polygon])
  const read = await client.callTool({ name: 'get_scene' })
  assert.deepEqual(read.content, [{ type: 'text', text: JSON.stringify(snapshot) }])
  const conflict = await client.callTool({ name: 'apply_command', arguments: args })
  assert.equal(conflict.isError, true)
  assert.match(JSON.stringify(conflict.content), new RegExp(args.commandId))
})
