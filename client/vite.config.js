import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ── Dev Proxy ─────────────────────────────────────────────────────
  // Forwards /api requests to the Express server so cookies are
  // treated as same-origin (fixes sameSite:lax cookie rejection).
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux:  ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  ...(mode === 'production' ? { sourcemap: false } : { sourcemap: true }),
}))
