import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.ts'
import { localService } from '../../../config/local-service.ts'

const file = process.env.SCENE_FILE
  ? resolve(process.env.SCENE_FILE)
  : fileURLToPath(new URL('../../../data/scene.json', import.meta.url))
const server = createApp(file, process.env.DEBUG_SCENE === '1')
const { host, port } = localService()
const address = await server.listen({ host, port })
console.log('Scene service:', address, '\nFile:', file)
