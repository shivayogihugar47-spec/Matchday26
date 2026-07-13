import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@vapi-ai'))                          return 'vendor-vapi';
            if (id.includes('framer-motion'))                     return 'vendor-motion';
            if (id.includes('react-markdown') || id.includes('remark')) return 'vendor-markdown';
            if (id.includes('leaflet'))                           return 'vendor-leaflet';
            if (id.includes('@tanstack'))                         return 'vendor-query';
            if (id.includes('zustand'))                           return 'vendor-zustand';
            if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react';
          }
        },
      },
    },
  },
})
