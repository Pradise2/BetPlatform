import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // or 'es2022' to support top-level await
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
