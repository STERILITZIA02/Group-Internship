import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const proxy = { '/api': 'http://127.0.0.1:' + (process.env.SCENE_API_PORT ?? '4174') }

export default defineConfig({
  plugins: [vue()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy },
  preview: { proxy },
})
