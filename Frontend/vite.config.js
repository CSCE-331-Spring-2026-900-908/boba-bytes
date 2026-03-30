import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
    root: '..',
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    server: {
        host: true,
        port: 5173,
        proxy: {
        '/api': {
            target: 'http://localhost:3001',   // ← Changed to your actual backend port
            changeOrigin: true,
            secure: false,
        }
    }
  }
})