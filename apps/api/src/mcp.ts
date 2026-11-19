import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { requestSchema } from '@garden/scene'
import { z } from 'zod'

const api = 'http://127.0.0.1:' + (process.env.SCENE_API_PORT ?? '4174') + '/api/scene'
const server = new McpServer({ name: 'local-scene', version: '1.0.0' })
async function call(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  return {
    isError: !response.ok,
    content: [{ type: 'text' as const, text: await response.text() }],
  }
}
server.registerTool('get_scene', { description: 'Read the local scene and its revision.' }, () =>
  call(api),
)
server.registerTool(
  'apply_command',
  {
    description: 'Apply one polygon edit at the revision returned by get_scene.',
    inputSchema: {
      baseRevision: requestSchema.shape.baseRevision,
      command: requestSchema.shape.command,
      commandId: z.uuid().optional(),
    },
  },
  (edit) =>
    call(api + '/commands', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...edit, commandId: edit.commandId ?? crypto.randomUUID() }),
    }),
)
await server.connect(new StdioServerTransport())
