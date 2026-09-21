import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/PROFIT/', // Explicit base URL for GitHub Pages repo /PROFIT/
  server: {
    port: 3000,
    open: false
  }
})
