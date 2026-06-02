import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.FRONTEND_PORT || 3201;
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3200';

// Proxy API routes (raw streaming — no body parsing here)
const apiProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'warn',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Proxy error' });
  }
});

app.use('/auth', apiProxy);
app.use('/user', apiProxy);
app.use('/okr', apiProxy);
app.use('/health', apiProxy);

// Serve production frontend
const distPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(distPath));

// SPA fallback (Express 5 compatible)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production Frontend + API Proxy running on port ${PORT}`);
  console.log(`   Frontend: ${distPath}`);
  console.log(`   API proxy → ${BACKEND_URL}`);
});
