import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// === Configuration ===
const PORT = process.env.PORT || 3200;                    // Public port (what your reverse proxy / panel should point to)
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3201';

// === API Proxy (only these paths go to backend) ===
const apiProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'warn',
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(502).json({ error: 'Bad gateway' });
  }
});

app.use('/auth', apiProxy);
app.use('/user', apiProxy);
app.use('/okr', apiProxy);
app.use('/health', apiProxy);

// === Serve Production Frontend ===
const distPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(distPath));

// === SPA Fallback (Express 5 compatible) ===
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// === Start Server ===
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Production Server running on port ${PORT}`);
  console.log(`   Frontend served from: ${distPath}`);
  console.log(`   API routes proxied to: ${BACKEND_URL}`);
  console.log(`   Listening on all interfaces (0.0.0.0)\n`);
});

