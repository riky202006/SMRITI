import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'html2canvas': path.resolve(__dirname, './src/utils/emptyShim.js'),
      'dompurify': path.resolve(__dirname, './src/utils/emptyShim.js'),
      'canvg': path.resolve(__dirname, './src/utils/emptyShim.js'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          leaflet: ['leaflet'],
          jspdf: ['jspdf'],
        },
      },
    },
  },
});
