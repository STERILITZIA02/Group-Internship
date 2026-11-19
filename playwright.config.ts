import { defineConfig } from '@playwright/test'
import { localHost, localService } from './config/local-service.ts'
const api = localService(4185)
const webPort = 4186
const baseURL = 'http://' + localHost + ':' + webPort
const env = { SCENE_API_PORT: String(api.port) }
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: {
    baseURL,
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
  webServer: [
    { command: 'node apps/api/test/browser-fixture.ts', url: api.origin + '/api/scene', env },
    {
      command: 'pnpm --filter @garden/web preview --port ' + webPort + ' --strictPort',
      url: baseURL,
      env,
    },
  ],
})
