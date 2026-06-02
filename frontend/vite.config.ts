import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',  // Добавляем базовый URL
  plugins: [react()],
  server: {
    port: 3201,  // Явно указываем порт
    proxy: {
      '/auth': 'http://localhost:3200/',
      '/user': 'http://localhost:3200/',
      '/okr': 'http://localhost:3200/',
    },
  },
  build: {
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
    },
    // Добавляем опцию для корректного разрешения путей
    commonjsOptions: {
      esmExternals: true
    }
  }
})

