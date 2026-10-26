import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const PLANTNET_API_KEY = process.env.VITE_PLANTNET_API_KEY || process.env.PLANTNET_API_KEY || '2b10qSHoLPAnN9YdAbFC9k8X1O';

function herbauraDevApiPlugin() {
  return {
    name: 'herbaura-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        // Quick check to see if local Flask backend is responding on port 5000
        let isFlaskRunning = false;
        try {
          const ctrl = new AbortController();
          const tid = setTimeout(() => ctrl.abort(), 180);
          const chk = await fetch('http://127.0.0.1:5000/api/health', { signal: ctrl.signal });
          clearTimeout(tid);
          isFlaskRunning = chk.ok;
        } catch {
          isFlaskRunning = false;
        }

        // If Flask is running, pass to Vite proxy
        if (isFlaskRunning) {
          return next();
        }

        // --- FLASK IS OFFLINE: Resilient Dev Handlers to prevent 502 and 403 errors ---

        // 1. /api/health
        if (req.url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'healthy',
            service: 'Herbora Botanical Server (Dev Mode)',
            version: '1.0.0'
          }));
          return;
        }

        // 2. /api/identify - Forward to Pl@ntNet directly in Node.js (ZERO browser CORS!)
        if (req.url.startsWith('/api/identify') && req.method === 'POST') {
          try {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            const contentType = req.headers['content-type'] || 'multipart/form-data';

            const pnetRes = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}`, {
              method: 'POST',
              headers: { 'content-type': contentType },
              body: buffer
            });

            const text = await pnetRes.text();
            res.statusCode = pnetRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(text);
            return;
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Botanical proxy error', details: err.message }));
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    herbauraDevApiPlugin()
  ],
  publicDir: path.resolve(import.meta.dirname || '.', 'public'),
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res && res.writeHead && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Backend temporarily offline', fallback: true }));
            }
          });
        }
      }
    }
  }
});

