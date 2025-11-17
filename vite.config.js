import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  resolve: {
    alias: {
      '/src': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssMinify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        guide: resolve(__dirname, 'public/guide/index.html'),
        // Add other HTML files as needed
      }
    }
  },
  server: {
    port: 3000,
    open: '/',
    fs: {
      // Allow serving files from one level up (parent directory)
      // This lets us access /src/css/main.css from HTML in /public/
      allow: ['..']
    }
  }
});
