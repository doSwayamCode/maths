import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps the build working when opened from any folder or sub-path
// (handy for offline use on an exhibition laptop via `npm run preview`).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {

          motion: ['framer-motion'],
          charts: ['recharts'],
          katex: ['katex'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  test: { environment: 'node', include: ['tests/**/*.test.js'] },
});
