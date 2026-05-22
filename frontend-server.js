import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.FRONTEND_PORT || 4001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:4000';

// Proxy API routes to the backend
const apiProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'warn',
});

// API paths that should be proxied
app.use('/auth', apiProxy);
app.use('/user', apiProxy);
app.use('/okr', apiProxy);
app.use('/health', apiProxy);

// Serve production frontend static files
const distPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(distPath));

// SPA fallback - send index.html for all other routes
// Note: Express 5 requires regex for catch-all instead of '*'
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production Frontend + API Proxy running on port ${PORT}`);
  console.log(`   Frontend: ${distPath}`);
  console.log(`   API proxy → ${BACKEND_URL}`);
});
