import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    cssMinify: true
  },
  server: {
    port: 3000,
    open: true
  }
});
