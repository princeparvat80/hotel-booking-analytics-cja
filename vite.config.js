import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// TripNest dev server config
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true
  }
})
