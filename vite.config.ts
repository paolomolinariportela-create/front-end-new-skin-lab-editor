import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'front-end-new-skin-lab-editor-production.up.railway.app'
    ],
    host: '0.0.0.0', // Permite conexões externas
  },
  preview: {
    allowedHosts: [
      'front-end-new-skin-lab-editor-production.up.railway.app'
    ],
    host: '0.0.0.0',
    port: 4173 // Porta padrão do vite preview
  }
})
