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

// Load environment variables - load from current directory
dotenv.config({ path: path.join(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express apps
const app = express();
const frontendApp = express();

// Support both PORT and BACKEND_PORT for compatibility
const BACKEND_PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT) : (process.env.PORT ? parseInt(process.env.PORT) : 4000);
const FRONTEND_PORT = process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT) : 3000;

// Initialize Prisma client
const prisma = new PrismaClient();

// CORS options
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Backend API Middleware
app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).send();
  } else {
    next();
  }
});
app.use(express.json());

// API Routes - MUST come before static file serving
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/okr', okrRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'OKR Server is running' });
});

// Frontend static files
const staticPath = path.join(__dirname, 'frontend/dist');
frontendApp.use(express.static(staticPath));

// Handle SPA routing - use a function with proper ES module syntax
frontendApp.use((req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Log available routes for debugging
console.log('Auth routes loaded:', authRoutes.stack?.map((r: any) => r.route?.path).filter(Boolean) || []);

// Start backend server
app.listen(BACKEND_PORT, '0.0.0.0', () => {
  console.log('🚀 OKR Backend Server Started!');
  console.log(`📍 Backend API: http://localhost:${BACKEND_PORT}/health`);
  console.log(`📍 Auth routes mounted at: http://localhost:${BACKEND_PORT}/auth`);
});

// Start frontend server
frontendApp.listen(FRONTEND_PORT, '0.0.0.0', () => {
  console.log('🚀 OKR Frontend Server Started!');
  console.log(`📍 Frontend: http://localhost:${FRONTEND_PORT}`);
  console.log(`📍 Static files from: ${staticPath}`);
  console.log('');
  console.log('💡 Для остановки нажмите Ctrl+C');
});
