import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
  existsSync
} from 'fs';

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

// Dev-only plugin: persist design-panel themes as JSON files in public/themes/.
// Exposes GET /__dp/themes, PUT /__dp/themes/:id, DELETE /__dp/themes/:id.
// Runs exclusively during `vite dev`; production builds never include this code.
const designPanelThemesPlugin = () => {
  const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
  const ID_RE = /^thm_[a-z0-9]{1,32}$/;
  const PROP_KEY_RE = /^--[a-z][a-z0-9-]*$/;
  const SCHEME_KEYS = ['default', 'subtle', 'accent'];
  const MAX_BODY_BYTES = 64 * 1024;

  const themesDir = resolve(__dirname, 'public/themes');

  const send = (res, status, payload) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
  };

  const sendError = (res, status, code, error) => {
    send(res, status, { ok: false, code, error });
  };

  const isLocalhost = (req) => {
    // Only the real socket address is consulted — X-Forwarded-For and similar
    // headers are deliberately ignored so they cannot be spoofed to bypass
    // the loopback check.
    const addr = req.socket && req.socket.remoteAddress;
    return typeof addr === 'string' && LOOPBACK.has(addr);
  };

  const ensureThemesDir = () => {
    if (!existsSync(themesDir)) {
      mkdirSync(themesDir, { recursive: true });
    }
  };

  const validateBundle = (body, urlId) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { code: 'SCHEMA_MISMATCH', error: 'body must be a JSON object' };
    }
    if (body.id !== urlId) {
      return { code: 'BAD_ID', error: 'body.id must match URL id' };
    }
    if (typeof body.name !== 'string' || body.name.length < 1 || body.name.length > 80) {
      return { code: 'BAD_NAME', error: 'name must be a string of length 1-80' };
    }
    if (body.schemaVersion !== 1) {
      return { code: 'SCHEMA_MISMATCH', error: 'schemaVersion must be 1' };
    }
    if (!body.typography || typeof body.typography !== 'object' || Array.isArray(body.typography)) {
      return { code: 'SCHEMA_MISMATCH', error: 'typography must be an object' };
    }
    for (const key of Object.keys(body.typography)) {
      if (!PROP_KEY_RE.test(key)) {
        return { code: 'BAD_PROPERTY_KEY', error: `invalid typography property key: ${key}` };
      }
    }
    if (!body.schemes || typeof body.schemes !== 'object' || Array.isArray(body.schemes)) {
      return { code: 'SCHEMA_MISMATCH', error: 'schemes must be an object' };
    }
    for (const schemeKey of SCHEME_KEYS) {
      const scheme = body.schemes[schemeKey];
      if (!scheme || typeof scheme !== 'object' || Array.isArray(scheme)) {
        return { code: 'SCHEMA_MISMATCH', error: `schemes.${schemeKey} must be an object` };
      }
      for (const mode of ['light', 'dark']) {
        const modeObj = scheme[mode];
        if (!modeObj || typeof modeObj !== 'object' || Array.isArray(modeObj)) {
          return { code: 'SCHEMA_MISMATCH', error: `schemes.${schemeKey}.${mode} must be an object` };
        }
        for (const key of Object.keys(modeObj)) {
          if (!PROP_KEY_RE.test(key)) {
            return { code: 'BAD_PROPERTY_KEY', error: `invalid schemes.${schemeKey}.${mode} property key: ${key}` };
          }
        }
      }
    }
    return null;
  };

  const readBody = (req) => new Promise((resolvePromise, rejectPromise) => {
    const chunks = [];
    let size = 0;
    let aborted = false;
    req.on('data', (chunk) => {
      if (aborted) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        aborted = true;
        rejectPromise(new Error('BODY_TOO_LARGE'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (aborted) return;
      resolvePromise(Buffer.concat(chunks).toString('utf-8'));
    });
    req.on('error', rejectPromise);
  });

  const listThemes = () => {
    ensureThemesDir();
    const entries = readdirSync(themesDir);
    const themes = [];
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue;
      if (entry.endsWith('.tmp')) continue;
      const fullPath = join(themesDir, entry);
      try {
        const raw = readFileSync(fullPath, 'utf-8');
        themes.push(JSON.parse(raw));
      } catch {
        // Skip unreadable or malformed entries rather than failing the whole list.
      }
    }
    return themes;
  };

  return {
    name: 'design-panel-themes',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/__dp/themes')) {
          next();
          return;
        }

        if (!isLocalhost(req)) {
          sendError(res, 403, 'FORBIDDEN', 'localhost only');
          return;
        }

        // Strip query string before matching paths.
        const pathOnly = url.split('?')[0];

        // GET /__dp/themes
        if (req.method === 'GET' && pathOnly === '/__dp/themes') {
          try {
            const themes = listThemes();
            send(res, 200, { ok: true, themes });
          } catch (err) {
            sendError(res, 500, 'READ_FAILED', err && err.message ? err.message : 'list failed');
          }
          return;
        }

        // PUT /__dp/themes/:id or DELETE /__dp/themes/:id
        const idMatch = pathOnly.match(/^\/__dp\/themes\/([^/]+)$/);
        if (idMatch) {
          const rawId = decodeURIComponent(idMatch[1]);
          if (!ID_RE.test(rawId)) {
            sendError(res, 400, 'BAD_ID', 'id must match /^thm_[a-z0-9]{1,32}$/');
            return;
          }
          const targetPath = join(themesDir, `${rawId}.json`);
          const tmpPath = `${targetPath}.tmp`;

          if (req.method === 'PUT') {
            let raw;
            try {
              raw = await readBody(req);
            } catch (err) {
              if (err && err.message === 'BODY_TOO_LARGE') {
                sendError(res, 413, 'BODY_TOO_LARGE', 'request body exceeds 64 KB');
              } else {
                sendError(res, 400, 'READ_FAILED', 'could not read request body');
              }
              return;
            }
            let body;
            try {
              body = JSON.parse(raw);
            } catch {
              sendError(res, 400, 'SCHEMA_MISMATCH', 'body is not valid JSON');
              return;
            }
            const err = validateBundle(body, rawId);
            if (err) {
              sendError(res, 400, err.code, err.error);
              return;
            }

            // Serialize EXACTLY the validated body so the response field and the
            // on-disk file are byte-identical.
            const serialized = JSON.stringify(body, null, 2);
            try {
              ensureThemesDir();
              writeFileSync(tmpPath, serialized, 'utf-8');
              renameSync(tmpPath, targetPath);
            } catch (writeErr) {
              // Clean up the temp file if it lingers.
              try { unlinkSync(tmpPath); } catch { /* ignore */ }
              sendError(res, 500, 'WRITE_FAILED', writeErr && writeErr.message ? writeErr.message : 'write failed');
              return;
            }
            send(res, 200, { ok: true, theme: body });
            return;
          }

          if (req.method === 'DELETE') {
            if (!existsSync(targetPath)) {
              sendError(res, 404, 'NOT_FOUND', 'theme does not exist');
              return;
            }
            try {
              const raw = readFileSync(targetPath, 'utf-8');
              const existing = JSON.parse(raw);
              if (existing && existing.isDefault === true) {
                sendError(res, 403, 'DEFAULT_THEME', 'default theme cannot be deleted');
                return;
              }
            } catch (readErr) {
              sendError(res, 500, 'READ_FAILED', readErr && readErr.message ? readErr.message : 'read failed');
              return;
            }
            try {
              unlinkSync(targetPath);
            } catch (delErr) {
              sendError(res, 500, 'DELETE_FAILED', delErr && delErr.message ? delErr.message : 'delete failed');
              return;
            }
            send(res, 200, { ok: true });
            return;
          }

          sendError(res, 405, 'METHOD_NOT_ALLOWED', `method ${req.method} not allowed`);
          return;
        }

        sendError(res, 404, 'NOT_FOUND', 'unknown __dp route');
      });
    }
  };
};

export default defineConfig({
  plugins: [devCssPlugin(), designPanelThemesPlugin(), copyPrintCss()],
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
