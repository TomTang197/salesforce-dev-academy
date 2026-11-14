import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5188,
    host: true,
  },
  preview: {
    port: 5188,
  },
  build: {
    rollupOptions: {
      output: {
        // Long-lived chunks: framework and icons rarely change, course content changes
        // independently of UI code, so each can stay cached across updates.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.includes('lucide-react') ? 'icons' : 'vendor';
          }
          if (id.includes('/src/data/')) return 'content';
          return undefined;
        },
      },
    },
  },
});
