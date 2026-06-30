import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Only used locally — in production frontend calls VITE_API_URL directly
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
