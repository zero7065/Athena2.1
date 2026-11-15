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
          // Keep lucide-react and react in main bundle to prevent icon errors
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react') || id.includes('react') || id.includes('react-dom')) return null;
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('chess.js')) return 'vendor-chess';
            if (id.includes('motion')) return 'vendor-motion';
            if (id.includes('clsx') || id.includes('tailwind-merge')) return 'vendor-utils';
            if (id.includes('react-markdown')) return 'vendor-markdown';
            if (id.includes('framer-motion')) return 'vendor-animation';
            return 'vendor';
          }
          // Feature chunks for lazy-loaded pages only
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
