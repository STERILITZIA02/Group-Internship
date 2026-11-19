import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { localService, defaultWebPort } from '../../config/local-service.ts'

const api = localService()
const proxy = { '/api': api.origin }

export default defineConfig({
  plugins: [vue()],
  server: { host: api.host, port: defaultWebPort, strictPort: true, proxy },
  preview: { proxy },
})
