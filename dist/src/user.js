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
const middleware_1 = require("./middleware");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Middleware для проверки роли admin
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Требуется роль администратора' });
    }
    next();
}
// Получить свой профиль
router.get('/me', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    if (!user)
        return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
}));
// Получить список всех пользователей (только просмотр)
router.get('/all', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany({
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    res.json(users);
}));
// Обновить имя/фамилию пользователя
router.patch('/me', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) {
        return res.status(400).json({ error: 'Имя и фамилия обязательны' });
    }
    const user = yield prisma.user.update({
        where: { id: req.user.userId },
        data: { firstName, lastName },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    res.json(user);
}));
// Сменить пароль пользователя
router.post('/change-password', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword, newPasswordConfirm } = req.body;
    if (!oldPassword || !newPassword || !newPasswordConfirm) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (newPassword !== newPasswordConfirm) {
        return res.status(400).json({ error: 'Пароли не совпадают' });
    }
    const user = yield prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user)
        return res.status(404).json({ error: 'Пользователь не найден' });
    const valid = yield bcrypt_1.default.compare(oldPassword, user.password);
    if (!valid) {
        return res.status(400).json({ error: 'Старый пароль неверен' });
    }
    const hash = yield bcrypt_1.default.hash(newPassword, 10);
    yield prisma.user.update({ where: { id: req.user.userId }, data: { password: hash } });
    res.json({ success: true });
}));
// Удалить пользователя (только admin)
router.delete('/:userId', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    // Check if user is admin
    const currentUser = yield prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true }
    });
    if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) !== 'ADMIN') {
        return res.status(403).json({ error: 'Требуются права администратора' });
    }
    // Prevent deleting self
    if (req.user.userId === userId) {
        return res.status(400).json({ error: 'Нельзя удалить самого себя' });
    }
    try {
        // Delete all related records in transaction
        yield prisma.$transaction([
            // Delete weekly monitoring entries
            prisma.weeklyMonitoringEntry.deleteMany({
                where: {
                    keyResult: {
                        goal: {
                            okr: { userId }
                        }
                    }
                }
            }),
            // Delete key results
            prisma.keyResult.deleteMany({
                where: {
                    goal: {
                        okr: { userId }
                    }
                }
            }),
            // Delete goals
            prisma.goal.deleteMany({
                where: {
                    okr: { userId }
                }
            }),
            // Delete OKRs
            prisma.oKR.deleteMany({
                where: { userId }
            }),
            // Finally, delete the user
            prisma.user.delete({
                where: { id: userId }
            })
        ]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            error: 'Ошибка при удалении пользователя',
            details: error instanceof Error ? error.message : 'Неизвестная ошибка'
        });
    }
}));
exports.default = router;
