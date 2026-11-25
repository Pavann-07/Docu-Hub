import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Load environment variables from the single global .env file at repository root.
// In dev, /api and /health are also proxied to FastAPI when VITE_API_URL is empty.
export default defineConfig({
  envDir: '..',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/docs': 'http://localhost:8000',
      '/openapi.json': 'http://localhost:8000',
    },
  },
})
