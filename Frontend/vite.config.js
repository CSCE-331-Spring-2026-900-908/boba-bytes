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
        proxy: {
            '/api': 'http://localhost:3001',
        },
    },
})