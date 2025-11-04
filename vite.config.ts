import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['framer-motion', 'lucide-react'],
            'editor-vendor': ['@monaco-editor/react', 'monaco-editor'],
            'query-vendor': ['@tanstack/react-query'],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: false,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '.pankh.ai', // Allows all pankh.ai subdomains
        'portal-dev.pankh.ai',
        'backend-dev.pankh.ai',
      ],
      hmr: {
        overlay: true,
        clientPort: 3000,
      },
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://backend-dev.pankh.ai',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Add API key header if available
              const apiKey = env.VITE_API_KEY
              if (apiKey) {
                proxyReq.setHeader('X-API-Key', apiKey)
              }
            })
          },
        },
        '/health': {
          target: env.VITE_API_PROXY_TARGET || 'http://backend-dev.pankh.ai',
          changeOrigin: true,
          secure: false,
        },
        '/metrics': {
          target: env.VITE_API_PROXY_TARGET || 'http://backend-dev.pankh.ai',
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: env.VITE_API_PROXY_TARGET?.replace('http', 'ws') || 'ws://backend-dev.pankh.ai',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})
