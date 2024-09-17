import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'terser',
    cssMinify: 'esbuild',
    terserOptions: {
      compress: {
        keep_infinity: true,
        drop_debugger: true,
        drop_console: true,
      },
      mangle: {
        toplevel: true,
        module: true,
      },
    },
  },
});
