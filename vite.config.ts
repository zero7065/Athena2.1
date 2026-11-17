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
        // Keep React's own modules together.
        // Splitting react / react-dom / lucide-react across chunks reorders
        // React 19.2's CommonJS namespace init (qe = {} emitted after the
        // factory call) which crashes the app on boot with
        // "Cannot set properties of undefined (setting 'Activity')".
        // Everything ELSE is split into feature/vendor chunks so heavy,
        // optional libraries (charts, chess, markdown, dnd) are NOT pulled
        // into the initial bundle — they load only with the feature that
        // imports them.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) {
            if (id.includes('/components/Games')) return 'feature-games';
            if (id.includes('/components/CBTExam')) return 'feature-cbt';
            if (id.includes('/components/AdminPanel')) return 'feature-admin';
            if (id.includes('/components/LecturerPortal')) return 'feature-lecturer';
            if (id.includes('/components/EduRSS')) return 'feature-rss';
            if (id.includes('/components/AIChatbot')) return 'feature-ai';
            return null;
          }

          // React core (must stay in ONE chunk).
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-is|loose-envify|js-tokens)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (id.includes('lucide-react')) return 'vendor-react';

          // Heavy, optional libraries — isolated so they load on demand.
          if (id.includes('recharts') || id.includes('victory-vendor') || /[\\/]node_modules[\\/]d3-/.test(id)) {
            return 'charts';
          }
          if (id.includes('chess.js')) return 'chess';
          if (id.includes('@hello-pangea')) return 'dnd';

          // Everything else (markdown stack, clsx, tailwind-merge, etc.): let
          // Rollup place it naturally so libs used by a single lazy feature
          // (e.g. react-markdown -> AIChatbot) ship with that feature instead
          // of being dragged into the initial load.
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
