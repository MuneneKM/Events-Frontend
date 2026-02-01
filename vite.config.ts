import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://eventive.localhost:8001/api/method',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, '')
      }
    }
  }
})
