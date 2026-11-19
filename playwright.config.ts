import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4186',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
  webServer: [
    { command: 'node apps/api/test/browser-fixture.ts', url: 'http://127.0.0.1:4185/api/scene' },
    {
      command: 'pnpm --filter @garden/web preview --port 4186 --strictPort',
      url: 'http://127.0.0.1:4186',
      env: { SCENE_API_PORT: '4185' },
    },
  ],
})
