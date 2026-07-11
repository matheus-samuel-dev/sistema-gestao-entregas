import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.indexOf('/node_modules/recharts/') !== -1) {
            return 'vendor-charts';
          }
          if (normalized.indexOf('/node_modules/leaflet/') !== -1 || normalized.indexOf('/node_modules/react-leaflet/') !== -1) {
            return 'vendor-maps';
          }
          if (
            normalized.indexOf('/node_modules/react/') !== -1 ||
            normalized.indexOf('/node_modules/react-dom/') !== -1 ||
            normalized.indexOf('/node_modules/react-router') !== -1 ||
            normalized.indexOf('/node_modules/@mui/') !== -1 ||
            normalized.indexOf('/node_modules/@emotion/') !== -1
          ) {
            return 'vendor-ui';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts'
  }
});
