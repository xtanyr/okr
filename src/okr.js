"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var prisma = new client_1.PrismaClient();
var router = (0, express_1.Router)();
// Вспомогательная функция для расчёта 'факт' по формуле
function calcFact(kr) {
    var values = (kr.weeklyMonitoring || []).map(function (w) { return w.value; });
    var base = kr.base || 0;
    if (!values.length)
        return 0;
    var result;
    switch ((kr.formula || '').toLowerCase()) {
        case 'макс':
            result = Math.max.apply(Math, values);
            break;
        case 'среднее':
            result = values.reduce(function (a, b) { return a + b; }, 0) / values.length;
            break;
        case 'текущее':
            result = values[values.length - 1];
            break;
        case 'мин':
            result = Math.min.apply(Math, values);
            break;
        case 'сумма':
            result = values.reduce(function (a, b) { return a + b; }, 0);
            break;
        case 'макс без базы':
            result = Math.max.apply(Math, values) - base;
            break;
        case 'среднее без базы':
            result = values.reduce(function (a, b) { return a + b; }, 0) / values.length - base;
            break;
        case 'текущее без базы':
            result = values[values.length - 1] - base;
            break;
        case 'минимум без базы':
            result = Math.min.apply(Math, values) - base;
            break;
        case 'сумма без базы':
            result = values.reduce(function (a, b) { return a + b; }, 0) - base;
            break;
        default:
            result = Math.max.apply(Math, values); // по умолчанию макс
    }
    // Округляем до 2 знаков после запятой
    return Math.round(result * 100) / 100;
}
// Получить все OKR текущего пользователя
router.get('/', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var okrs, okrsWithFact;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.oKR.findMany({
                    where: { userId: req.user.userId },
                    include: {
                        goals: {
                            orderBy: { order: 'asc' },
                            include: {
                                keyResults: {
                                    orderBy: { order: 'asc' },
                                    include: {
                                        weeklyMonitoring: true,
                                    },
                                },
                            },
                        },
                    },
                })];
            case 1:
                okrs = _a.sent();
                okrsWithFact = okrs.map(function (okr) { return (__assign(__assign({}, okr), { goals: okr.goals.map(function (goal) { return (__assign(__assign({}, goal), { keyResults: goal.keyResults.map(function (kr) { return (__assign(__assign({}, kr), { fact: calcFact(kr) })); }) })); }) })); });
                res.json(okrsWithFact);
                return [2 /*return*/];
        }
    });
}); });
// Создать OKR
router.post('/', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var period, existingOkr, okr;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                period = req.body.period;
                if (!period) {
                    return [2 /*return*/, res.status(400).json({ error: 'Период обязателен' })];
                }
                return [4 /*yield*/, prisma.oKR.findFirst({
                        where: {
                            userId: req.user.userId,
                            period: period.trim(),
                        },
                    })];
            case 1:
                existingOkr = _a.sent();
                if (existingOkr) {
                    console.log("\u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0434\u0443\u0431\u043B\u0438\u0440\u0443\u044E\u0449\u0438\u0439 OKR: ".concat(period, " \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ").concat(req.user.userId));
                    return [2 /*return*/, res.status(400).json({ error: "OKR \u0441 \u043F\u0435\u0440\u0438\u043E\u0434\u043E\u043C \"".concat(period, "\" \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442") })];
                }
                return [4 /*yield*/, prisma.oKR.create({
                        data: {
                            userId: req.user.userId,
                            period: period,
                            archived: false,
                            startDate: req.body.startDate,
                            endDate: req.body.endDate,
                        },
                    })];
            case 2:
                okr = _a.sent();
                res.status(201).json(okr);
                return [2 /*return*/];
        }
    });
}); });
// Обновить OKR (только если не архивирован и принадлежит пользователю)
router.put('/:id', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, okr, _a, period, archived, updated;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, prisma.oKR.findUnique({ where: { id: id } })];
            case 1:
                okr = _b.sent();
                if (!okr || okr.userId !== req.user.userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа' })];
                }
                if (okr.archived) {
                    return [2 /*return*/, res.status(400).json({ error: 'OKR в архиве' })];
                }
                _a = req.body, period = _a.period, archived = _a.archived;
                return [4 /*yield*/, prisma.oKR.update({
                        where: { id: id },
                        data: { period: period, archived: archived },
                    })];
            case 2:
                updated = _b.sent();
                res.json(updated);
                return [2 /*return*/];
        }
    });
}); });
// Архивировать OKR
router.post('/:id/archive', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, okr, updated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, prisma.oKR.findUnique({ where: { id: id } })];
            case 1:
                okr = _a.sent();
                if (!okr || okr.userId !== req.user.userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа' })];
                }
                return [4 /*yield*/, prisma.oKR.update({
                        where: { id: id },
                        data: { archived: true },
                    })];
            case 2:
                updated = _a.sent();
                res.json(updated);
                return [2 /*return*/];
        }
    });
}); });
// Дублирование OKR вместе с целями и KR
router.post('/:id/duplicate', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, okr, newOKR;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, prisma.oKR.findUnique({
                        where: { id: id },
                        include: {
                            goals: {
                                include: {
                                    keyResults: true,
                                },
                            },
                        },
                    })];
            case 1:
                okr = _a.sent();
                if (!okr || okr.userId !== req.user.userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа' })];
                }
                return [4 /*yield*/, prisma.oKR.create({
                        data: {
                            userId: okr.userId,
                            period: okr.period + ' (копия)',
                            archived: false,
                            goals: {
                                create: okr.goals.map(function (goal) { return ({
                                    title: goal.title,
                                    keyInitiatives: goal.keyInitiatives,
                                    keyResults: {
                                        create: goal.keyResults.map(function (kr) { return ({
                                            title: kr.title,
                                            metric: kr.metric,
                                            base: kr.base,
                                            plan: kr.plan,
                                            formula: kr.formula,
                                        }); }),
                                    },
                                }); }),
                            },
                        },
                        include: {
                            goals: { include: { keyResults: true } },
                        },
                    })];
            case 2:
                newOKR = _a.sent();
                res.status(201).json(newOKR);
                return [2 /*return*/];
        }
    });
}); });
// Добавить цель в OKR
router.post('/:okrId/goal', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var okrId, _a, title, keyInitiatives, okr, lastGoal, newOrder, goal;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                okrId = req.params.okrId;
                _a = req.body, title = _a.title, keyInitiatives = _a.keyInitiatives;
                return [4 /*yield*/, prisma.oKR.findUnique({ where: { id: okrId } })];
            case 1:
                okr = _b.sent();
                if (!okr || okr.userId !== req.user.userId || okr.archived) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа или OKR в архиве' })];
                }
                return [4 /*yield*/, prisma.goal.findFirst({ where: { okrId: okrId }, orderBy: { order: 'desc' } })];
            case 2:
                lastGoal = _b.sent();
                newOrder = lastGoal ? lastGoal.order + 1 : 0;
                return [4 /*yield*/, prisma.goal.create({
                        data: {
                            okrId: okrId,
                            title: title,
                            keyInitiatives: keyInitiatives || '',
                            order: newOrder,
                        },
                    })];
            case 3:
                goal = _b.sent();
                res.status(201).json(goal);
                return [2 /*return*/];
        }
    });
}); });
// Обновить цель (в т.ч. ключевые инициативы)
router.put('/:okrId/goal/:goalId', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, okrId, goalId, _b, title, keyInitiatives, okr, goal;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.params, okrId = _a.okrId, goalId = _a.goalId;
                _b = req.body, title = _b.title, keyInitiatives = _b.keyInitiatives;
                return [4 /*yield*/, prisma.oKR.findUnique({ where: { id: okrId } })];
            case 1:
                okr = _c.sent();
                if (!okr || okr.userId !== req.user.userId || okr.archived) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа или OKR в архиве' })];
                }
                return [4 /*yield*/, prisma.goal.update({
                        where: { id: goalId },
                        data: { title: title, keyInitiatives: keyInitiatives },
                    })];
            case 2:
                goal = _c.sent();
                res.json(goal); // goal содержит order
                return [2 /*return*/];
        }
    });
}); });
// Удалить цель
router.delete('/:okrId/goal/:goalId', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, okrId, goalId, okr, keyResults, _i, keyResults_1, kr;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, okrId = _a.okrId, goalId = _a.goalId;
                return [4 /*yield*/, prisma.oKR.findUnique({ where: { id: okrId } })];
            case 1:
                okr = _b.sent();
                if (!okr || okr.userId !== req.user.userId || okr.archived) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа или OKR в архиве' })];
                }
                return [4 /*yield*/, prisma.keyResult.findMany({ where: { goalId: goalId } })];
            case 2:
                keyResults = _b.sent();
                _i = 0, keyResults_1 = keyResults;
                _b.label = 3;
            case 3:
                if (!(_i < keyResults_1.length)) return [3 /*break*/, 6];
                kr = keyResults_1[_i];
                return [4 /*yield*/, prisma.weeklyMonitoringEntry.deleteMany({ where: { keyResultId: kr.id } })];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6: return [4 /*yield*/, prisma.keyResult.deleteMany({ where: { goalId: goalId } })];
            case 7:
                _b.sent();
                return [4 /*yield*/, prisma.goal.delete({ where: { id: goalId } })];
            case 8:
                _b.sent();
                res.json({ success: true });
                return [2 /*return*/];
        }
    });
}); });
// Добавить ключевой результат в цель
router.post('/goal/:goalId/keyresult', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var goalId, _a, title, metric, base, plan, formula, goal, lastKR, newOrder, kr;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                goalId = req.params.goalId;
                _a = req.body, title = _a.title, metric = _a.metric, base = _a.base, plan = _a.plan, formula = _a.formula;
                return [4 /*yield*/, prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } })];
            case 1:
                goal = _b.sent();
                if (!goal || goal.okr.userId !== req.user.userId || goal.okr.archived) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа или OKR в архиве' })];
                }
                return [4 /*yield*/, prisma.keyResult.findFirst({ where: { goalId: goalId }, orderBy: { order: 'desc' } })];
            case 2:
                lastKR = _b.sent();
                newOrder = lastKR ? lastKR.order + 1 : 0;
                return [4 /*yield*/, prisma.keyResult.create({
                        data: {
                            goalId: goalId,
                            title: title,
                            metric: metric,
                            base: base,
                            plan: plan,
                            formula: formula,
                            order: newOrder,
                        },
                    })];
            case 3:
                kr = _b.sent();
                res.status(201).json(kr);
                return [2 /*return*/];
        }
    });
}); });
// Обновить ключевой результат
router.put('/goal/:goalId/keyresult/:krId', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, goalId, krId, _b, title, metric, base, plan, formula, comment, goal, kr;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.params, goalId = _a.goalId, krId = _a.krId;
                _b = req.body, title = _b.title, metric = _b.metric, base = _b.base, plan = _b.plan, formula = _b.formula, comment = _b.comment;
                return [4 /*yield*/, prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } })];
            case 1:
                goal = _c.sent();
                if (!goal || goal.okr.userId !== req.user.userId || goal.okr.archived) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа или OKR в архиве' })];
                }
                return [4 /*yield*/, prisma.keyResult.update({
                        where: { id: krId },
                        data: {
                            title: title,
                            metric: metric,
                            base: base,
                            plan: plan,
                            formula: formula,
                            comment: comment || null, // Сохраняем комментарий или null, если не передан
                        },
                    })];
            case 2:
                kr = _c.sent();
                res.json(kr);
                return [2 /*return*/];
        }
    });
}); });
// Удалить ключевой результат
router.delete('/goal/:goalId/keyresult/:krId', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, goalId, krId, goal, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, goalId = _a.goalId, krId = _a.krId;
                return [4 /*yield*/, prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } })];
            case 1:
                goal = _b.sent();
                if (!goal || goal.okr.userId !== req.user.userId || goal.okr.archived) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа или OKR в архиве' })];
                }
                _b.label = 2;
            case 2:
                _b.trys.push([2, 5, , 6]);
                // Сначала удаляем связанные записи weeklyMonitoring
                return [4 /*yield*/, prisma.weeklyMonitoringEntry.deleteMany({ where: { keyResultId: krId } })];
            case 3:
                // Сначала удаляем связанные записи weeklyMonitoring
                _b.sent();
                // Затем удаляем сам KR
                return [4 /*yield*/, prisma.keyResult.delete({ where: { id: krId } })];
            case 4:
                // Затем удаляем сам KR
                _b.sent();
                res.json({ success: true });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                console.error('Ошибка при удалении ключевого результата:', error_1);
                res.status(500).json({ error: 'Ошибка при удалении ключевого результата' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Добавить/обновить значение недельного мониторинга
router.post('/keyresult/:krId/monitoring', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var krId, _a, weekNumber, value, kr, entry;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                krId = req.params.krId;
                _a = req.body, weekNumber = _a.weekNumber, value = _a.value;
                return [4 /*yield*/, prisma.keyResult.findUnique({ where: { id: krId }, include: { goal: { include: { okr: true } } } })];
            case 1:
                kr = _b.sent();
                if (!kr || kr.goal.okr.userId !== req.user.userId || kr.goal.okr.archived) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа или OKR в архиве' })];
                }
                return [4 /*yield*/, prisma.weeklyMonitoringEntry.upsert({
                        where: { keyResultId_weekNumber: { keyResultId: krId, weekNumber: weekNumber } },
                        update: { value: value },
                        create: { keyResultId: krId, weekNumber: weekNumber, value: value },
                    })];
            case 2:
                entry = _b.sent();
                res.json(entry);
                return [2 /*return*/];
        }
    });
}); });
// Получить значения недельного мониторинга по KR
router.get('/keyresult/:krId/monitoring', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var krId, kr, entries;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                krId = req.params.krId;
                return [4 /*yield*/, prisma.keyResult.findUnique({
                        where: { id: krId },
                        include: {
                            goal: {
                                include: {
                                    okr: true
                                }
                            }
                        }
                    })];
            case 1:
                kr = _a.sent();
                if (!kr) {
                    return [2 /*return*/, res.status(404).json({ error: 'Ключевой результат не найден' })];
                }
                return [4 /*yield*/, prisma.weeklyMonitoringEntry.findMany({
                        where: { keyResultId: krId },
                        orderBy: { weekNumber: 'asc' } // Сортируем по номеру недели
                    })];
            case 2:
                entries = _a.sent();
                res.json(entries);
                return [2 /*return*/];
        }
    });
}); });
// Справочники формул и метрик
var FORMULAS = [
    'Макс',
    'Среднее',
    'Текущее',
    'Мин',
    'Сумма',
    'Макс без базы',
    'Среднее без базы',
    'Текущее без базы',
    'Минимум без базы',
    'Сумма без базы',
];
var METRICS = ['%', 'Рубли', 'Штуки'];
router.get('/dictionaries', middleware_1.requireAuth, function (req, res) {
    res.json({ formulas: FORMULAS, metrics: METRICS });
});
// Просмотр OKR другого пользователя (только чтение)
router.get('/user/:userId', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, okrs, okrsWithFact;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.userId;
                return [4 /*yield*/, prisma.oKR.findMany({
                        where: { userId: userId },
                        include: {
                            goals: {
                                orderBy: { order: 'asc' },
                                include: {
                                    keyResults: {
                                        orderBy: { order: 'asc' },
                                        include: {
                                            weeklyMonitoring: true,
                                        },
                                    },
                                },
                            },
                        },
                    })];
            case 1:
                okrs = _a.sent();
                okrsWithFact = okrs.map(function (okr) { return (__assign(__assign({}, okr), { startDate: okr.startDate, endDate: okr.endDate, goals: okr.goals.map(function (goal) { return (__assign(__assign({}, goal), { keyResults: goal.keyResults.map(function (kr) { return (__assign(__assign({}, kr), { fact: calcFact(kr) })); }) })); }) })); });
                res.json(okrsWithFact);
                return [2 /*return*/];
        }
    });
}); });
// Дублирование цели вместе с KR
router.post('/goal/:goalId/duplicate', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var goalId, goal, lastGoal, newOrder, newGoal;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                goalId = req.params.goalId;
                return [4 /*yield*/, prisma.goal.findUnique({
                        where: { id: goalId },
                        include: { okr: true, keyResults: true },
                    })];
            case 1:
                goal = _a.sent();
                if (!goal || goal.okr.userId !== req.user.userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа' })];
                }
                return [4 /*yield*/, prisma.goal.findFirst({ where: { okrId: goal.okrId }, orderBy: { order: 'desc' } })];
            case 2:
                lastGoal = _a.sent();
                newOrder = lastGoal ? lastGoal.order + 1 : 0;
                return [4 /*yield*/, prisma.goal.create({
                        data: {
                            okrId: goal.okrId,
                            title: goal.title + ' (копия)',
                            keyInitiatives: goal.keyInitiatives,
                            order: newOrder,
                            keyResults: {
                                create: goal.keyResults.map(function (kr, idx) { return ({
                                    title: kr.title,
                                    metric: kr.metric,
                                    base: kr.base,
                                    plan: kr.plan,
                                    formula: kr.formula,
                                    order: idx,
                                }); }),
                            },
                        },
                        include: { keyResults: true },
                    })];
            case 3:
                newGoal = _a.sent();
                res.status(201).json(newGoal);
                return [2 /*return*/];
        }
    });
}); });
// Дублирование ключевого результата
router.post('/goal/:goalId/keyresult/:krId/duplicate', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, goalId, krId, goal, kr, lastKR, newOrder, newKR;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, goalId = _a.goalId, krId = _a.krId;
                return [4 /*yield*/, prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } })];
            case 1:
                goal = _b.sent();
                return [4 /*yield*/, prisma.keyResult.findUnique({ where: { id: krId } })];
            case 2:
                kr = _b.sent();
                if (!goal || !kr || goal.okr.userId !== req.user.userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа' })];
                }
                return [4 /*yield*/, prisma.keyResult.findFirst({ where: { goalId: goalId }, orderBy: { order: 'desc' } })];
            case 3:
                lastKR = _b.sent();
                newOrder = lastKR ? lastKR.order + 1 : 0;
                return [4 /*yield*/, prisma.keyResult.create({
                        data: {
                            goalId: goalId,
                            title: kr.title + ' (копия)',
                            metric: kr.metric,
                            base: kr.base,
                            plan: kr.plan,
                            formula: kr.formula,
                            order: newOrder,
                        },
                    })];
            case 4:
                newKR = _b.sent();
                res.status(201).json(newKR);
                return [2 /*return*/];
        }
    });
}); });
// Обновить комментарий KR
router.patch('/goal/:goalId/keyresult/:krId/comment', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, goalId, krId, comment, kr, updated;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, goalId = _a.goalId, krId = _a.krId;
                comment = req.body.comment;
                return [4 /*yield*/, prisma.keyResult.findUnique({ where: { id: krId }, include: { goal: { include: { okr: true } } } })];
            case 1:
                kr = _b.sent();
                if (!kr || kr.goalId !== goalId || kr.goal.okr.userId !== req.user.userId || kr.goal.okr.archived) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа или OKR в архиве' })];
                }
                return [4 /*yield*/, prisma.keyResult.update({ where: { id: krId }, data: { comment: comment } })];
            case 2:
                updated = _b.sent();
                res.json(updated);
                return [2 /*return*/];
        }
    });
}); });
// Смена порядка целей внутри OKR
router.post('/:id/reorder-goals', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, goalIds, okr, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                goalIds = req.body.goalIds;
                return [4 /*yield*/, prisma.oKR.findUnique({ where: { id: id } })];
            case 1:
                okr = _a.sent();
                if (!okr || okr.userId !== req.user.userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа' })];
                }
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < goalIds.length)) return [3 /*break*/, 5];
                return [4 /*yield*/, prisma.goal.update({ where: { id: goalIds[i] }, data: { order: i } })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 2];
            case 5:
                res.json({ success: true });
                return [2 /*return*/];
        }
    });
}); });
// Смена порядка KR внутри цели
router.post('/goal/:goalId/reorder-keyresults', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var goalId, krIds, goal, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                goalId = req.params.goalId;
                krIds = req.body.krIds;
                return [4 /*yield*/, prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } })];
            case 1:
                goal = _a.sent();
                if (!goal || goal.okr.userId !== req.user.userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа' })];
                }
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < krIds.length)) return [3 /*break*/, 5];
                return [4 /*yield*/, prisma.keyResult.update({ where: { id: krIds[i] }, data: { order: i } })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 2];
            case 5:
                res.json({ success: true });
                return [2 /*return*/];
        }
    });
}); });
// Удалить OKR
router.delete('/:id', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, okr, goals, _i, goals_1, goal, keyResults, _a, keyResults_2, kr, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, prisma.oKR.findUnique({ where: { id: id } })];
            case 1:
                okr = _b.sent();
                if (!okr || okr.userId !== req.user.userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа' })];
                }
                _b.label = 2;
            case 2:
                _b.trys.push([2, 15, , 16]);
                return [4 /*yield*/, prisma.goal.findMany({ where: { okrId: id } })];
            case 3:
                goals = _b.sent();
                _i = 0, goals_1 = goals;
                _b.label = 4;
            case 4:
                if (!(_i < goals_1.length)) return [3 /*break*/, 12];
                goal = goals_1[_i];
                return [4 /*yield*/, prisma.keyResult.findMany({ where: { goalId: goal.id } })];
            case 5:
                keyResults = _b.sent();
                _a = 0, keyResults_2 = keyResults;
                _b.label = 6;
            case 6:
                if (!(_a < keyResults_2.length)) return [3 /*break*/, 9];
                kr = keyResults_2[_a];
                return [4 /*yield*/, prisma.weeklyMonitoringEntry.deleteMany({ where: { keyResultId: kr.id } })];
            case 7:
                _b.sent();
                _b.label = 8;
            case 8:
                _a++;
                return [3 /*break*/, 6];
            case 9: 
            // Затем удаляем сами KR
            return [4 /*yield*/, prisma.keyResult.deleteMany({ where: { goalId: goal.id } })];
            case 10:
                // Затем удаляем сами KR
                _b.sent();
                _b.label = 11;
            case 11:
                _i++;
                return [3 /*break*/, 4];
            case 12: 
            // Удаляем цели
            return [4 /*yield*/, prisma.goal.deleteMany({ where: { okrId: id } })];
            case 13:
                // Удаляем цели
                _b.sent();
                // Удаляем сам OKR
                return [4 /*yield*/, prisma.oKR.delete({ where: { id: id } })];
            case 14:
                // Удаляем сам OKR
                _b.sent();
                res.json({ success: true });
                return [3 /*break*/, 16];
            case 15:
                error_2 = _b.sent();
                console.error('Ошибка при удалении OKR:', error_2);
                res.status(500).json({ error: 'Ошибка при удалении OKR' });
                return [3 /*break*/, 16];
            case 16: return [2 /*return*/];
        }
    });
}); });
// Archive/Unarchive OKR
router.patch('/:id/archive', middleware_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, archived, okr, updatedOkr;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                archived = req.body.archived;
                return [4 /*yield*/, prisma.oKR.findUnique({
                        where: { id: id },
                    })];
            case 1:
                okr = _a.sent();
                if (!okr) {
                    return [2 /*return*/, res.status(404).json({ error: 'OKR не найден' })];
                }
                if (okr.userId !== req.user.userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Нет доступа' })];
                }
                return [4 /*yield*/, prisma.oKR.update({
                        where: { id: id },
                        data: { archived: archived === true },
                    })];
            case 2:
                updatedOkr = _a.sent();
                res.json(updatedOkr);
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
