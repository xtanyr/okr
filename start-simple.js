#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var path_1 = require("path");
var url_1 = require("url");
var http_1 = require("http");
var client_1 = require("@prisma/client");
var auth_1 = require("./src/auth");
var user_1 = require("./src/user");
var okr_1 = require("./src/okr");
// Load environment variables
dotenv_1.default.config();
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var app = (0, express_1.default)();
var BACKEND_PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT) : 4000;
var FRONTEND_PORT = process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT) : 4001;
// Initialize Prisma client
var prisma = new client_1.PrismaClient();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files from the frontend/dist directory
var staticPath = path_1.default.join(__dirname, 'frontend/dist');
app.use(express_1.default.static(staticPath));
// API Routes
app.use('/auth', auth_1.default);
app.use('/user', user_1.default);
app.use('/okr', okr_1.default);
// Health check endpoint
app.get('/health', function (req, res) {
    res.json({ status: 'ok', message: 'OKR Server is running' });
});
// Error handling middleware
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
// Start the backend server
var server = (0, http_1.createServer)(app);
server.listen(Number(BACKEND_PORT), '0.0.0.0', function () {
    console.log('🚀 OKR Backend Server Started!');
    console.log("\uD83D\uDCCD Backend API: http://localhost:".concat(BACKEND_PORT, "/health"));
});
// Create a separate server for the frontend
var frontendApp = (0, express_1.default)();
frontendApp.use(express_1.default.static(staticPath));
// Handle all other routes by serving index.html
frontendApp.use(function (req, res) {
    res.sendFile(path_1.default.join(staticPath, 'index.html'));
});
frontendApp.listen(Number(FRONTEND_PORT), '0.0.0.0', function () {
    console.log('🚀 OKR Frontend Server Started!');
    console.log("\uD83D\uDCCD Frontend: http://localhost:".concat(FRONTEND_PORT));
    console.log("\uD83D\uDCCD Static files from: ".concat(staticPath));
    console.log('');
    console.log('💡 Для остановки нажмите Ctrl+C');
});
