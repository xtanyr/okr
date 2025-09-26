import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',  // Добавляем базовый URL
  plugins: [react()],
  server: {
    port: 4001,  // Явно указываем порт
    proxy: {
      '/auth': 'http://92.124.137.137:4000/',
      '/user': 'http://92.124.137.137:4000/',
      '/okr': 'http://92.124.137.137:4000/',
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
