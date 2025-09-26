"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("./email");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const REGISTRATION_CODE = process.env.REGISTRATION_CODE || 'okr2025';
// Генерация аватарки: первые две буквы имени + случайный фон (цвет)
function generateAvatar(name) {
    const initials = name.slice(0, 2).toUpperCase();
    const colors = ['#FFB300', '#1E88E5', '#43A047', '#E53935', '#8E24AA', '#F4511E'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return { initials, color };
}
// Регистрация
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, passwordConfirm, firstName, lastName, codeWord } = req.body;
    if (!email || !password || !passwordConfirm || !firstName || !lastName || !codeWord) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (codeWord !== REGISTRATION_CODE) {
        return res.status(400).json({ error: 'Неверное кодовое слово для регистрации' });
    }
    if (password !== passwordConfirm) {
        return res.status(400).json({ error: 'Пароли не совпадают' });
    }
    const existing = yield prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    const hash = yield bcrypt_1.default.hash(password, 10);
    const user = yield prisma.user.create({
        data: {
            email,
            password: hash,
            firstName,
            lastName,
            role: 'USER',
        },
    });
    const avatar = generateAvatar(firstName);
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, firstName, lastName, role: user.role, avatar } });
}));
// Логин
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    const valid = yield bcrypt_1.default.compare(password, user.password);
    if (!valid) {
        return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    const avatar = generateAvatar(user.firstName);
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, avatar } });
}));
// Password reset request
router.post('/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }
        // Generate reset token (valid for 1 hour)
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
        yield prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });
        // Send email with reset link
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}reset-password?token=${resetToken}`;
        yield (0, email_1.sendPasswordResetEmail)(email, resetUrl);
        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Error processing password reset request' });
    }
}));
// Reset password
router.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password, passwordConfirm } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    if (!password || !passwordConfirm) {
        return res.status(400).json({ error: 'Password and confirmation are required' });
    }
    if (password !== passwordConfirm) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }
    try {
        // Find user by reset token and check if it's still valid
        const user = yield prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gte: new Date(Date.now() - 3600000) // Token not expired
                }
            }
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        // Update password and clear reset token
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        res.json({ message: 'Password has been reset successfully' });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Error resetting password' });
    }
}));
exports.default = router;
