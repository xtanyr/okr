#!/usr/bin/env -S node --loader tsx

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

// Import routes with .js extension for ES modules
import authRoutes from './src/auth';
import userRoutes from './src/user';
import okrRoutes from './src/okr';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express apps
const app = express();
const frontendApp = express();
const BACKEND_PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT) : 4000;
const FRONTEND_PORT = process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT) : 3000;

// Initialize Prisma client
const prisma = new PrismaClient();

// Backend API Middleware
app.use(cors());
app.use(express.json());

// Frontend static files
const staticPath = path.join(__dirname, 'frontend/dist');
frontendApp.use(express.static(staticPath));

// API Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/okr', okrRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'OKR Server is running' });
});

// Handle SPA routing - use a function with proper ES module syntax
frontendApp.use((req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start backend server
app.listen(BACKEND_PORT, '0.0.0.0', () => {
  console.log('🚀 OKR Backend Server Started!');
  console.log(`📍 Backend API: http://localhost:${BACKEND_PORT}/health`);
});

// Start frontend server
frontendApp.listen(FRONTEND_PORT, '0.0.0.0', () => {
  console.log('🚀 OKR Frontend Server Started!');
  console.log(`📍 Frontend: http://localhost:${FRONTEND_PORT}`);
  console.log(`📍 Static files from: ${staticPath}`);
  console.log('');
  console.log('💡 Для остановки нажмите Ctrl+C');
});
