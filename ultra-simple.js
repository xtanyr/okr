#!/usr/bin/env node

/**
 * OKR Ultra Simple Server
 * Максимально простой сервер без сложных зависимостей
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Инициализация переменных окружения
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Базовые middleware
app.use(cors());
app.use(express.json());

// Статические файлы
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Простой health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'OKR Server is running' });
});

// Простой fallback для SPA - без сложных регулярных выражений
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 OKR Ultra Simple Server Started!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 Static files: ${path.join(__dirname, 'frontend/dist')}`);
  console.log('');
  console.log('💡 Для остановки нажмите Ctrl+C');
});
