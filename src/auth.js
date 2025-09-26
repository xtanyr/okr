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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var client_1 = require("@prisma/client");
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var crypto_1 = require("crypto");
var email_1 = require("./email");
var prisma = new client_1.PrismaClient();
var router = (0, express_1.Router)();
var JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
var REGISTRATION_CODE = process.env.REGISTRATION_CODE || 'okr2025';
// Генерация аватарки: первые две буквы имени + случайный фон (цвет)
function generateAvatar(name) {
    var initials = name.slice(0, 2).toUpperCase();
    var colors = ['#FFB300', '#1E88E5', '#43A047', '#E53935', '#8E24AA', '#F4511E'];
    var color = colors[Math.floor(Math.random() * colors.length)];
    return { initials: initials, color: color };
}
// Регистрация
router.post('/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, passwordConfirm, firstName, lastName, codeWord, existing, hash, user, avatar, token;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password, passwordConfirm = _a.passwordConfirm, firstName = _a.firstName, lastName = _a.lastName, codeWord = _a.codeWord;
                if (!email || !password || !passwordConfirm || !firstName || !lastName || !codeWord) {
                    return [2 /*return*/, res.status(400).json({ error: 'Все поля обязательны' })];
                }
                if (codeWord !== REGISTRATION_CODE) {
                    return [2 /*return*/, res.status(400).json({ error: 'Неверное кодовое слово для регистрации' })];
                }
                if (password !== passwordConfirm) {
                    return [2 /*return*/, res.status(400).json({ error: 'Пароли не совпадают' })];
                }
                return [4 /*yield*/, prisma.user.findUnique({ where: { email: email } })];
            case 1:
                existing = _b.sent();
                if (existing) {
                    return [2 /*return*/, res.status(400).json({ error: 'Пользователь с таким email уже существует' })];
                }
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 2:
                hash = _b.sent();
                return [4 /*yield*/, prisma.user.create({
                        data: {
                            email: email,
                            password: hash,
                            firstName: firstName,
                            lastName: lastName,
                            role: 'USER',
                        },
                    })];
            case 3:
                user = _b.sent();
                avatar = generateAvatar(firstName);
                token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
                res.json({ token: token, user: { id: user.id, email: user.email, firstName: firstName, lastName: lastName, role: user.role, avatar: avatar } });
                return [2 /*return*/];
        }
    });
}); });
// Логин
router.post('/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, valid, avatar, token;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({ error: 'Email и пароль обязательны' })];
                }
                return [4 /*yield*/, prisma.user.findUnique({ where: { email: email } })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).json({ error: 'Неверный email или пароль' })];
                }
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
            case 2:
                valid = _b.sent();
                if (!valid) {
                    return [2 /*return*/, res.status(400).json({ error: 'Неверный email или пароль' })];
                }
                avatar = generateAvatar(user.firstName);
                token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
                res.json({ token: token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, avatar: avatar } });
                return [2 /*return*/];
        }
    });
}); });
// Password reset request
router.post('/forgot-password', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user, resetToken, resetTokenExpiry, resetUrl, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                if (!email) {
                    return [2 /*return*/, res.status(400).json({ error: 'Email is required' })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, prisma.user.findUnique({ where: { email: email } })];
            case 2:
                user = _a.sent();
                // Always return success to prevent email enumeration
                if (!user) {
                    return [2 /*return*/, res.json({ message: 'If an account with that email exists, a password reset link has been sent.' })];
                }
                resetToken = crypto_1.default.randomBytes(32).toString('hex');
                resetTokenExpiry = new Date(Date.now() + 3600000);
                return [4 /*yield*/, prisma.user.update({
                        where: { email: email },
                        data: {
                            resetToken: resetToken,
                            resetTokenExpiry: resetTokenExpiry,
                        },
                    })];
            case 3:
                _a.sent();
                resetUrl = "".concat(process.env.FRONTEND_URL || 'http://localhost:3000', "reset-password?token=").concat(resetToken);
                return [4 /*yield*/, (0, email_1.sendPasswordResetEmail)(email, resetUrl)];
            case 4:
                _a.sent();
                res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error('Password reset error:', error_1);
                res.status(500).json({ error: 'Error processing password reset request' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Reset password
router.post('reset-password', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, token, password, passwordConfirm, user, hashedPassword, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, token = _a.token, password = _a.password, passwordConfirm = _a.passwordConfirm;
                if (!token) {
                    return [2 /*return*/, res.status(400).json({ error: 'Token is required' })];
                }
                if (!password || !passwordConfirm) {
                    return [2 /*return*/, res.status(400).json({ error: 'Password and confirmation are required' })];
                }
                if (password !== passwordConfirm) {
                    return [2 /*return*/, res.status(400).json({ error: 'Passwords do not match' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                return [4 /*yield*/, prisma.user.findFirst({
                        where: {
                            resetToken: token,
                            resetTokenExpiry: {
                                gte: new Date(Date.now() - 3600000) // Token not expired
                            }
                        }
                    })];
            case 2:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid or expired token' })];
                }
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 3:
                hashedPassword = _b.sent();
                return [4 /*yield*/, prisma.user.update({
                        where: { id: user.id },
                        data: {
                            password: hashedPassword,
                            resetToken: null,
                            resetTokenExpiry: null,
                        },
                    })];
            case 4:
                _b.sent();
                res.json({ message: 'Password has been reset successfully' });
                return [3 /*break*/, 6];
            case 5:
                error_2 = _b.sent();
                console.error('Password reset error:', error_2);
                res.status(500).json({ error: 'Error resetting password' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
