import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // NO manual chunking - everything in one bundle to prevent lucide-react icon errors
        chunkFileNames: (chunkInfo) => {
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxDev: false,
  },
});
