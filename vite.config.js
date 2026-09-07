import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'public');

function servePublicIfPresent(req) {
  const pathname = decodeURIComponent((req.url || '').split('?')[0]);
  const local = path.resolve(publicDir, `.${pathname}`);
  if (!local.startsWith(publicDir + path.sep)) return;
  if (existsSync(local)) return pathname;
}

// Proxy Frappe/Kamra APIs so the SPA on :5173 avoids CORS during local dev.
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/assets': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        bypass: servePublicIfPresent,
      },
      '/files': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
