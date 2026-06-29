import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        // Forward all API calls through Vite so the browser never hits the backend directly
        '^/(get-|save-|recommend|health|debug)': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
