import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.FRONTEND_PORT || 4001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:4000';

// Parse JSON bodies **only** for API paths (required for reliable proxying of POST/PUT)
app.use(['/auth', '/user', '/okr', '/health'], express.json());

// Proxy middleware with body re-attachment (fixes req.body === undefined on backend)
const apiProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'warn',
  onProxyReq: (proxyReq, req) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
});

app.use('/auth', apiProxy);
app.use('/user', apiProxy);
app.use('/okr', apiProxy);
app.use('/health', apiProxy);

// Serve production frontend build
const distPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(distPath));

// SPA fallback (Express 5 compatible)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production Frontend + API Proxy running on port ${PORT}`);
  console.log(`   Frontend static: ${distPath}`);
  console.log(`   API proxy → ${BACKEND_URL} for /auth, /user, /okr, /health`);
});
