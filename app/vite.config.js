import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Demo por tunel (VS Code Ports / devtunnels): acepta el host reenviado
  // y escucha en todas las interfaces. En local sigue funcionando igual.
  server: {
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
})
