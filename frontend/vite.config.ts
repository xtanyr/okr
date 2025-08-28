
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://158.160.136.51:4000',
      '/user': 'http://158.160.136.51:4000',
      '/okr': 'http://158.160.136.51:4000',
    },
  },
  build: {
    // Оптимизации для сборки
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled']
        }
      }
    }
  }
})
