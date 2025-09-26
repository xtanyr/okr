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
var middleware_1 = require("./middleware");
var bcrypt_1 = require("bcrypt");
var prisma = new client_1.PrismaClient();
var router = (0, express_1.Router)();
// Middleware для проверки роли admin
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Требуется роль администратора' });
    }
    next();
}
// Получить свой профиль
router.get('/me', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.user.findUnique({
                    where: { id: req.user.userId },
                    select: { id: true, email: true, firstName: true, lastName: true, role: true },
                })];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, res.status(404).json({ error: 'Пользователь не найден' })];
                res.json(user);
                return [2 /*return*/];
        }
    });
}); });
// Получить список всех пользователей (только просмотр)
router.get('/all', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.user.findMany({
                    select: { id: true, email: true, firstName: true, lastName: true, role: true },
                })];
            case 1:
                users = _a.sent();
                res.json(users);
                return [2 /*return*/];
        }
    });
}); });
// Обновить имя/фамилию пользователя
router.patch('/me', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, firstName, lastName, user;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, firstName = _a.firstName, lastName = _a.lastName;
                if (!firstName || !lastName) {
                    return [2 /*return*/, res.status(400).json({ error: 'Имя и фамилия обязательны' })];
                }
                return [4 /*yield*/, prisma.user.update({
                        where: { id: req.user.userId },
                        data: { firstName: firstName, lastName: lastName },
                        select: { id: true, email: true, firstName: true, lastName: true, role: true },
                    })];
            case 1:
                user = _b.sent();
                res.json(user);
                return [2 /*return*/];
        }
    });
}); });
// Сменить пароль пользователя
router.post('/change-password', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, oldPassword, newPassword, newPasswordConfirm, user, valid, hash;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, oldPassword = _a.oldPassword, newPassword = _a.newPassword, newPasswordConfirm = _a.newPasswordConfirm;
                if (!oldPassword || !newPassword || !newPasswordConfirm) {
                    return [2 /*return*/, res.status(400).json({ error: 'Все поля обязательны' })];
                }
                if (newPassword !== newPasswordConfirm) {
                    return [2 /*return*/, res.status(400).json({ error: 'Пароли не совпадают' })];
                }
                return [4 /*yield*/, prisma.user.findUnique({ where: { id: req.user.userId } })];
            case 1:
                user = _b.sent();
                if (!user)
                    return [2 /*return*/, res.status(404).json({ error: 'Пользователь не найден' })];
                return [4 /*yield*/, bcrypt_1.default.compare(oldPassword, user.password)];
            case 2:
                valid = _b.sent();
                if (!valid) {
                    return [2 /*return*/, res.status(400).json({ error: 'Старый пароль неверен' })];
                }
                return [4 /*yield*/, bcrypt_1.default.hash(newPassword, 10)];
            case 3:
                hash = _b.sent();
                return [4 /*yield*/, prisma.user.update({ where: { id: req.user.userId }, data: { password: hash } })];
            case 4:
                _b.sent();
                res.json({ success: true });
                return [2 /*return*/];
        }
    });
}); });
// Удалить пользователя (только admin)
router.delete('/:userId', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, currentUser, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.userId;
                return [4 /*yield*/, prisma.user.findUnique({
                        where: { id: req.user.userId },
                        select: { role: true }
                    })];
            case 1:
                currentUser = _a.sent();
                if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) !== 'ADMIN') {
                    return [2 /*return*/, res.status(403).json({ error: 'Требуются права администратора' })];
                }
                // Prevent deleting self
                if (req.user.userId === userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Нельзя удалить самого себя' })];
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                // Delete all related records in transaction
                return [4 /*yield*/, prisma.$transaction([
                        // Delete weekly monitoring entries
                        prisma.weeklyMonitoringEntry.deleteMany({
                            where: {
                                keyResult: {
                                    goal: {
                                        okr: { userId: userId }
                                    }
                                }
                            }
                        }),
                        // Delete key results
                        prisma.keyResult.deleteMany({
                            where: {
                                goal: {
                                    okr: { userId: userId }
                                }
                            }
                        }),
                        // Delete goals
                        prisma.goal.deleteMany({
                            where: {
                                okr: { userId: userId }
                            }
                        }),
                        // Delete OKRs
                        prisma.oKR.deleteMany({
                            where: { userId: userId }
                        }),
                        // Finally, delete the user
                        prisma.user.delete({
                            where: { id: userId }
                        })
                    ])];
            case 3:
                // Delete all related records in transaction
                _a.sent();
                res.json({ success: true });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('Error deleting user:', error_1);
                res.status(500).json({
                    error: 'Ошибка при удалении пользователя',
                    details: error_1 instanceof Error ? error_1.message : 'Неизвестная ошибка'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
