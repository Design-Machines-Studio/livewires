import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

// Plugin to copy print.css after build
const copyPrintCss = () => ({
  name: 'copy-print-css',
  writeBundle() {
    mkdirSync('public/dist/css', { recursive: true });
    copyFileSync('src/css/print.css', 'public/dist/css/print.css');
  }
});

// Plugin to serve empty CSS in dev (CSS is injected via JS)
const devCssPlugin = () => ({
  name: 'dev-css',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/dist/main.css') {
        res.setHeader('Content-Type', 'text/css');
        res.end('/* CSS loaded via JS in dev mode */');
        return;
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [devCssPlugin(), copyPrintCss()],
  root: 'public',
  resolve: {
    alias: {
      '/src': resolve(__dirname, 'src'),
      // In dev, serve /dist/main.js from source
      '/dist/main.js': resolve(__dirname, 'src/js/main.js')
    }
  },
  build: {
    // Build into public/dist/
    outDir: 'dist',
    emptyOutDir: true,
    cssMinify: true,
    // Don't process HTML - just build CSS and JS
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/js/main.js')
      },
      output: {
        // Fixed filenames (no hash) for easy HTML referencing
        assetFileNames: (assetInfo) => {
          // Name CSS file 'main.css' to match entry point
          if (assetInfo.name?.endsWith('.css') || assetInfo.name === 'style.css') {
            return 'main.css';
          }
          return '[name][extname]';
        },
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js'
      }
    }
  },
  server: {
    port: 3000,
    open: '/',
    fs: {
      allow: ['..']
    }
  }
});
