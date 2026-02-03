import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['front-end-new-skin-lab-editor-production.up.railway.app'],
    host: '0.0.0.0',
    headers: {
      "Content-Security-Policy": "frame-ancestors https://*.nuvemshop.com.br https://*.tiendanube.com https://admin.nuvemshop.com.br;",
    },
  },
  preview: {
    allowedHosts: ['front-end-new-skin-lab-editor-production.up.railway.app'],
    host: '0.0.0.0',
    port: 4173,
    headers: {
      "Content-Security-Policy": "frame-ancestors https://*.nuvemshop.com.br https://*.tiendanube.com https://admin.nuvemshop.com.br;",
    },
  }
})
