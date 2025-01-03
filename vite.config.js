import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://hihis.smukqyy.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/api/departments': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
}) 