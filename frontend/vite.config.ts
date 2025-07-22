import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:4000',
      '/user': 'http://localhost:4000',
      '/okr': 'http://localhost:4000',
    },
  },
})
