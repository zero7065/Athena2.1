import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
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
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // IMPORTANT: all node_modules must share ONE chunk.
        // Splitting react/react-dom/lucide across separate chunks reorders
        // React 19.2's CommonJS namespace init (qe = {} emitted after the
        // factory call) which crashes the app on boot with
        // "Cannot set properties of undefined (setting 'Activity')".
        manualChunks: (id) => {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('/components/Games')) return 'feature-games';
          if (id.includes('/components/CBTExam')) return 'feature-cbt';
          if (id.includes('/components/AdminPanel')) return 'feature-admin';
          if (id.includes('/components/LecturerPortal')) return 'feature-lecturer';
          if (id.includes('/components/EduRSS')) return 'feature-rss';
          if (id.includes('/components/AIChatbot')) return 'feature-ai';
          return null;
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'vendor') return 'assets/vendor-[hash].js';
          if (chunkInfo.name.startsWith('feature')) return 'assets/feature-[name]-[hash].js';
          return 'assets/[name]-[hash].js';
        },
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});
