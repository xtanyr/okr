import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './src/auth.js';
import userRouter from './src/user.js';
import okrRouter from './src/okr.js';

// Инициализация переменных окружения
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Serve static files from the frontend/dist directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// API routes
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/okr', okrRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ErrorHandler middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Serve index.html for all non-API routes (for React Router support)
app.get(/^\/(?!auth|user|okr|health).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Frontend served from: ${path.join(__dirname, 'frontend/dist')}`);
});
