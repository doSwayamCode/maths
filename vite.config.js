import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: '/' — assets load from the site root, as Netlify serves it.
// (Also works offline with `npm run preview` on the exhibition laptop.)
export default defineConfig({
  plugins: [react()],
  base: '/',
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
