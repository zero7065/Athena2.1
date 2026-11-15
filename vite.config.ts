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
        manualChunks: (id) => {
          // Keep ALL node_modules in main bundle to prevent cross-chunk icon errors
          if (id.includes('node_modules')) return null;
          // Only chunk feature components for lazy-loaded pages
          if (id.includes('/components/Games')) return 'feature-games';
          if (id.includes('/components/CBTExam')) return 'feature-cbt';
          if (id.includes('/components/AdminPanel')) return 'feature-admin';
          if (id.includes('/components/LecturerPortal')) return 'feature-lecturer';
          if (id.includes('/components/EduRSS')) return 'feature-rss';
          if (id.includes('/components/AIChatbot')) return 'feature-ai';
          return null;
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name.startsWith('vendor')) return 'assets/vendor-[name].[hash].js';
          if (chunkInfo.name.startsWith('feature')) return 'assets/feature-[name].[hash].js';
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
