import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    root: '..',
    publicDir: 'Frontend/public',
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
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})
