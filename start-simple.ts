#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';
import authRoutes from './src/auth';
import userRoutes from './src/user';
import okrRoutes from './src/okr';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const BACKEND_PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT) : 4000;
const FRONTEND_PORT = process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT) : 4001;

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend/dist directory
const staticPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(staticPath));

// API Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/okr', okrRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'OKR Server is running' });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the backend server
const server = createServer(app);

server.listen(Number(BACKEND_PORT), '0.0.0.0', () => {
  console.log('🚀 OKR Backend Server Started!');
  console.log(`📍 Backend API: http://localhost:${BACKEND_PORT}/health`);
});

// Create a separate server for the frontend
const frontendApp = express();
frontendApp.use(express.static(staticPath));

// Handle all other routes by serving index.html
frontendApp.use((req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

frontendApp.listen(Number(FRONTEND_PORT), '0.0.0.0', () => {
  console.log('🚀 OKR Frontend Server Started!');
  console.log(`📍 Frontend: http://localhost:${FRONTEND_PORT}`);
  console.log(`📍 Static files from: ${staticPath}`);
  console.log('');
  console.log('💡 Для остановки нажмите Ctrl+C');
});
