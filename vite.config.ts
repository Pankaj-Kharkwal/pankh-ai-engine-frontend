import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '.pankh.ai',  // Allows all pankh.ai subdomains
        'portal-dev.pankh.ai',
        'backend-dev.pankh.ai',
      ],
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Add API key header if available
              const apiKey = env.VITE_API_KEY;
              if (apiKey) {
                proxyReq.setHeader('X-API-Key', apiKey);
              }
            });
          },
        },
        '/health': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/metrics': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: env.VITE_API_PROXY_TARGET?.replace('http', 'ws') || 'ws://localhost:8000',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})
