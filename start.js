#!/usr/bin/env node

/**
 * OKR Startup Script - объединенный сервер
 * Запускает и backend API, и раздает frontend
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

app.use(cors());
app.use(express.json());

// Serve static files from the frontend/dist directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'OKR Server is running' });
});

// Serve index.html for all non-API routes (for React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 OKR Server Started!');
  console.log(`📍 Backend API: http://localhost:${PORT}/health`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 Static files from: ${path.join(__dirname, 'frontend/dist')}`);
  console.log('');
  console.log('💡 Для остановки нажмите Ctrl+C');
});
