import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.ts'

const file = process.env.SCENE_FILE
  ? resolve(process.env.SCENE_FILE)
  : fileURLToPath(new URL('../../../data/scene.json', import.meta.url))
const server = createApp(file, process.env.DEBUG_SCENE === '1')
const address = await server.listen({
  host: '127.0.0.1',
  port: Number(process.env.SCENE_API_PORT ?? 4174),
})
console.log('Scene service:', address, '\nFile:', file)
