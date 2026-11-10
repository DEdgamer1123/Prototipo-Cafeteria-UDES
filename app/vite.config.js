import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const apiProxy = {
  '/api': {
    target: 'http://127.0.0.1:8787',
    changeOrigin: false,
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Demo por tunel (VS Code Ports / devtunnels): acepta el host reenviado
  // y escucha en todas las interfaces. El backend local se consume por proxy
  // (/api -> 127.0.0.1:8787), asi que solo se expone el puerto 5173.
  server: {
    host: true,
    allowedHosts: true,
    proxy: apiProxy,
  },
  preview: {
    host: true,
    allowedHosts: true,
    proxy: apiProxy,
  },
})
