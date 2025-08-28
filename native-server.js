import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Загружаем .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4001;
const STATIC_DIR = path.join(__dirname, 'frontend/dist');

// MIME-типы
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Определяем MIME по расширению
function getMimeType(filePath) {
  const extname = path.extname(filePath);
  return mimeTypes[extname] || 'application/octet-stream';
}

// Читаем файл синхронно
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    return null;
  }
}

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  console.log(`${method} ${url}`);

  // CORS (если фронт будет обращаться к API на другом порту)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check только для этого сервера
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Static server is running' }));
    return;
  }

  // Раздаём статику
  let filePath = path.join(STATIC_DIR, url === '/' ? 'index.html' : url);

  if (!fs.existsSync(filePath)) {
    // Если файла нет — возвращаем index.html (для SPA)
    filePath = path.join(STATIC_DIR, 'index.html');
  }

  const content = readFile(filePath);

  if (content) {
    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
});

// Запуск сервера
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Static Frontend Server Started!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 Static files: ${STATIC_DIR}`);
  console.log('');
  console.log('💡 Для остановки нажмите Ctrl+C');
});

// Корректное завершение
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});