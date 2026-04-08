import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  assetsInclude: ['**/*.glb'],
  build: {
    chunkSizeWarningLimit: 1000
  }
})
