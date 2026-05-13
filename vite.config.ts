import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/PDFForge/',
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
})

// Trigger deployment workflow with corrected settings
