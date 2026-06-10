// vite.config.js
//
// PROXY: Quando o React chamar /api/tasks, o Vite vai
// encaminhar a requisição para http://localhost:5001
// (onde seu backend Node.js está rodando).
// Isso evita erros de CORS em desenvolvimento.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
