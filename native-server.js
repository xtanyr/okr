#!/usr/bin/env node

/**
 * OKR Native Node.js Server
 * Сервер на чистом Node.js без внешних зависимостей
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Инициализация переменных окружения
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4001;
const STATIC_DIR = path.join(__dirname, 'frontend/dist');

// MIME типы
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

// Функция для получения MIME типа
function getMimeType(filePath) {
  const extname = path.extname(filePath);
  return mimeTypes[extname] || 'application/octet-stream';
}

// Функция для чтения файла
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    return null;
  }
}

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;
  
  console.log(`${method} ${url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'OKR Server is running' }));
    return;
  }
  
  // API routes - интегрируем с существующим backend
if (url.startsWith('/auth') || url.startsWith('/user') || url.startsWith('/okr')) {
  // Проксируем запросы к вашему существующему backend
  const backendUrl = `http://127.0.0.1:4000${url}`;
  
  console.log(`🔄 Proxying ${method} ${url} to ${backendUrl}`);
  
  // Простой прокси через http.request
  const proxyReq = http.request(backendUrl, {
    method: method,
    headers: {
      ...req.headers,
      host: '127.0.0.1:4000'
    }
  }, (proxyRes) => {
    // Копируем заголовки ответа
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    res.writeHead(proxyRes.statusCode);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (error) => {
    console.error('❌ Proxy error:', error.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Backend connection failed',
      message: 'Cannot connect to backend API server on port 4000. Make sure backend is running with: npm start'
    }));
  });
  
  // Передаем тело запроса, если есть
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      if (body) {
        proxyReq.write(body);
      }
      proxyReq.end();
    });
  } else {
    proxyReq.end();
  }
  
  return;
}
  
  // Serve static files
  let filePath = path.join(STATIC_DIR, url === '/' ? 'index.html' : url);
  
  // Проверяем, существует ли файл
  if (!fs.existsSync(filePath)) {
    // Если файл не найден, возвращаем index.html для SPA routing
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

// Запускаем сервер
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 OKR Native Node.js Server Started!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 Static files: ${STATIC_DIR}`);
  console.log('');
  console.log('💡 Для остановки нажмите Ctrl+C');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
