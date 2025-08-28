#!/usr/bin/env node

/**
 * OKR Hybrid Server
 * Раздает фронтенд + проксирует API к существующему backend
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

const PORT = process.env.PORT || 4000;
const BACKEND_PORT = 4001; // Backend API на другом порту
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

function getMimeType(filePath) {
  const extname = path.extname(filePath);
  return mimeTypes[extname] || 'application/octet-stream';
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    return null;
  }
}

// Функция для проксирования API запросов к backend
function proxyToBackend(url, method, headers, body, res) {
  const options = {
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: url,
    method: method,
    headers: {
      ...headers,
      host: `localhost:${BACKEND_PORT}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error('Proxy error:', error);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Backend connection failed',
      message: 'Cannot connect to backend API server'
    }));
  });

  if (body) {
    proxyReq.write(body);
  }
  proxyReq.end();
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
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'OKR Hybrid Server is running',
      backend: `http://localhost:${BACKEND_PORT}`
    }));
    return;
  }
  
  // API routes - проксируем к backend
  if (url.startsWith('/auth') || url.startsWith('/user') || url.startsWith('/okr')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      proxyToBackend(url, method, req.headers, body, res);
    });
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
  console.log('🚀 OKR Hybrid Server Started!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 Backend API: http://localhost:${BACKEND_PORT}`);
  console.log(`📍 Static files: ${STATIC_DIR}`);
  console.log('');
  console.log('💡 Для остановки нажмите Ctrl+C');
  console.log('⚠️  Убедитесь, что backend запущен на порту 4001!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
