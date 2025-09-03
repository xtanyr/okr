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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const middleware_1 = require("./middleware");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Вспомогательная функция для расчёта 'факт' по формуле
function calcFact(kr) {
    const values = (kr.weeklyMonitoring || []).map((w) => w.value);
    const base = kr.base || 0;
    if (!values.length)
        return 0;
    let result;
    switch ((kr.formula || '').toLowerCase()) {
        case 'макс':
            result = Math.max(...values);
            break;
        case 'среднее':
            result = values.reduce((a, b) => a + b, 0) / values.length;
            break;
        case 'текущее':
            result = values[values.length - 1];
            break;
        case 'мин':
            result = Math.min(...values);
            break;
        case 'сумма':
            result = values.reduce((a, b) => a + b, 0);
            break;
        case 'макс без базы':
            result = Math.max(...values) - base;
            break;
        case 'среднее без базы':
            result = values.reduce((a, b) => a + b, 0) / values.length - base;
            break;
        case 'текущее без базы':
            result = values[values.length - 1] - base;
            break;
        case 'минимум без базы':
            result = Math.min(...values) - base;
            break;
        case 'сумма без базы':
            result = values.reduce((a, b) => a + b, 0) - base;
            break;
        default:
            result = Math.max(...values); // по умолчанию макс
    }
    // Округляем до 2 знаков после запятой
    return Math.round(result * 100) / 100;
}
// Получить все OKR текущего пользователя
router.get('/', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const okrs = yield prisma.oKR.findMany({
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
    });
    // Добавляем вычисление 'факт' для каждого KR
    const okrsWithFact = okrs.map((okr) => (Object.assign(Object.assign({}, okr), { goals: okr.goals.map((goal) => (Object.assign(Object.assign({}, goal), { keyResults: goal.keyResults.map((kr) => (Object.assign(Object.assign({}, kr), { fact: calcFact(kr) }))) }))) })));
    res.json(okrsWithFact);
}));
// Создать OKR
router.post('/', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { period } = req.body;
    if (!period) {
        return res.status(400).json({ error: 'Период обязателен' });
    }
    // Проверяем, существует ли уже OKR с таким периодом у этого пользователя
    const existingOkr = yield prisma.oKR.findFirst({
        where: {
            userId: req.user.userId,
            period: period.trim(),
        },
    });
    if (existingOkr) {
        console.log(`Попытка создать дублирующий OKR: ${period} для пользователя ${req.user.userId}`);
        return res.status(400).json({ error: `OKR с периодом "${period}" уже существует` });
    }
    const okr = yield prisma.oKR.create({
        data: {
            userId: req.user.userId,
            period,
            archived: false,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
        },
    });
    res.status(201).json(okr);
}));
// Обновить OKR (только если не архивирован и принадлежит пользователю)
router.put('/:id', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const okr = yield prisma.oKR.findUnique({ where: { id } });
    if (!okr || okr.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    if (okr.archived) {
        return res.status(400).json({ error: 'OKR в архиве' });
    }
    const { period, archived } = req.body;
    const updated = yield prisma.oKR.update({
        where: { id },
        data: { period, archived },
    });
    res.json(updated);
}));
// Архивировать OKR
router.post('/:id/archive', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const okr = yield prisma.oKR.findUnique({ where: { id } });
    if (!okr || okr.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    const updated = yield prisma.oKR.update({
        where: { id },
        data: { archived: true },
    });
    res.json(updated);
}));
// Дублирование OKR вместе с целями и KR
router.post('/:id/duplicate', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const okr = yield prisma.oKR.findUnique({
        where: { id },
        include: {
            goals: {
                include: {
                    keyResults: true,
                },
            },
        },
    });
    if (!okr || okr.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    const newOKR = yield prisma.oKR.create({
        data: {
            userId: okr.userId,
            period: okr.period + ' (копия)',
            archived: false,
            goals: {
                create: okr.goals.map((goal) => ({
                    title: goal.title,
                    keyInitiatives: goal.keyInitiatives,
                    keyResults: {
                        create: goal.keyResults.map((kr) => ({
                            title: kr.title,
                            metric: kr.metric,
                            base: kr.base,
                            plan: kr.plan,
                            formula: kr.formula,
                        })),
                    },
                })),
            },
        },
        include: {
            goals: { include: { keyResults: true } },
        },
    });
    res.status(201).json(newOKR);
}));
// Добавить цель в OKR
router.post('/:okrId/goal', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { okrId } = req.params;
    const { title, keyInitiatives } = req.body;
    const okr = yield prisma.oKR.findUnique({ where: { id: okrId } });
    if (!okr || okr.userId !== req.user.userId || okr.archived) {
        return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
    }
    const lastGoal = yield prisma.goal.findFirst({ where: { okrId }, orderBy: { order: 'desc' } });
    const newOrder = lastGoal ? lastGoal.order + 1 : 0;
    const goal = yield prisma.goal.create({
        data: {
            okrId,
            title,
            keyInitiatives: keyInitiatives || '',
            order: newOrder,
        },
    });
    res.status(201).json(goal);
}));
// Обновить цель (в т.ч. ключевые инициативы)
router.put('/:okrId/goal/:goalId', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { okrId, goalId } = req.params;
    const { title, keyInitiatives } = req.body;
    const okr = yield prisma.oKR.findUnique({ where: { id: okrId } });
    if (!okr || okr.userId !== req.user.userId || okr.archived) {
        return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
    }
    const goal = yield prisma.goal.update({
        where: { id: goalId },
        data: { title, keyInitiatives },
    });
    res.json(goal); // goal содержит order
}));
// Удалить цель
router.delete('/:okrId/goal/:goalId', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { okrId, goalId } = req.params;
    const okr = yield prisma.oKR.findUnique({ where: { id: okrId } });
    if (!okr || okr.userId !== req.user.userId || okr.archived) {
        return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
    }
    const keyResults = yield prisma.keyResult.findMany({ where: { goalId } });
    for (const kr of keyResults) {
        yield prisma.weeklyMonitoringEntry.deleteMany({ where: { keyResultId: kr.id } });
    }
    yield prisma.keyResult.deleteMany({ where: { goalId } });
    yield prisma.goal.delete({ where: { id: goalId } });
    res.json({ success: true });
}));
// Добавить ключевой результат в цель
router.post('/goal/:goalId/keyresult', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { goalId } = req.params;
    const { title, metric, base, plan, formula } = req.body;
    const goal = yield prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } });
    if (!goal || goal.okr.userId !== req.user.userId || goal.okr.archived) {
        return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
    }
    const lastKR = yield prisma.keyResult.findFirst({ where: { goalId }, orderBy: { order: 'desc' } });
    const newOrder = lastKR ? lastKR.order + 1 : 0;
    const kr = yield prisma.keyResult.create({
        data: {
            goalId,
            title,
            metric,
            base,
            plan,
            formula,
            order: newOrder,
        },
    });
    res.status(201).json(kr);
}));
// Обновить ключевой результат
router.put('/goal/:goalId/keyresult/:krId', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { goalId, krId } = req.params;
    const { title, metric, base, plan, formula, comment } = req.body;
    const goal = yield prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } });
    if (!goal || goal.okr.userId !== req.user.userId || goal.okr.archived) {
        return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
    }
    const kr = yield prisma.keyResult.update({
        where: { id: krId },
        data: {
            title,
            metric,
            base,
            plan,
            formula,
            comment: comment || null, // Сохраняем комментарий или null, если не передан
        },
    });
    res.json(kr);
}));
// Удалить ключевой результат
router.delete('/goal/:goalId/keyresult/:krId', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { goalId, krId } = req.params;
    const goal = yield prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } });
    if (!goal || goal.okr.userId !== req.user.userId || goal.okr.archived) {
        return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
    }
    try {
        // Сначала удаляем связанные записи weeklyMonitoring
        yield prisma.weeklyMonitoringEntry.deleteMany({ where: { keyResultId: krId } });
        // Затем удаляем сам KR
        yield prisma.keyResult.delete({ where: { id: krId } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Ошибка при удалении ключевого результата:', error);
        res.status(500).json({ error: 'Ошибка при удалении ключевого результата' });
    }
}));
// Добавить/обновить значение недельного мониторинга
router.post('/keyresult/:krId/monitoring', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { krId } = req.params;
    const { weekNumber, value } = req.body;
    const kr = yield prisma.keyResult.findUnique({ where: { id: krId }, include: { goal: { include: { okr: true } } } });
    if (!kr || kr.goal.okr.userId !== req.user.userId || kr.goal.okr.archived) {
        return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
    }
    // upsert: если запись за неделю есть — обновить, иначе создать
    const entry = yield prisma.weeklyMonitoringEntry.upsert({
        where: { keyResultId_weekNumber: { keyResultId: krId, weekNumber } },
        update: { value },
        create: { keyResultId: krId, weekNumber, value },
    });
    res.json(entry);
}));
// Получить значения недельного мониторинга по KR
router.get('/keyresult/:krId/monitoring', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { krId } = req.params;
    // Проверяем существование ключевого результата
    const kr = yield prisma.keyResult.findUnique({
        where: { id: krId },
        include: {
            goal: {
                include: {
                    okr: true
                }
            }
        }
    });
    if (!kr) {
        return res.status(404).json({ error: 'Ключевой результат не найден' });
    }
    // Разрешаем доступ всем аутентифицированным пользователям
    const entries = yield prisma.weeklyMonitoringEntry.findMany({
        where: { keyResultId: krId },
        orderBy: { weekNumber: 'asc' } // Сортируем по номеру недели
    });
    res.json(entries);
}));
// Справочники формул и метрик
const FORMULAS = [
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
const METRICS = ['%', 'Рубли', 'Штуки'];
router.get('/dictionaries', middleware_1.requireAuth, (req, res) => {
    res.json({ formulas: FORMULAS, metrics: METRICS });
});
// Просмотр OKR другого пользователя (только чтение)
router.get('/user/:userId', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const okrs = yield prisma.oKR.findMany({
        where: { userId },
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
    });
    // Добавляем вычисление 'факт' для каждого KR и возвращаем startDate/endDate
    const okrsWithFact = okrs.map((okr) => (Object.assign(Object.assign({}, okr), { startDate: okr.startDate, endDate: okr.endDate, goals: okr.goals.map((goal) => (Object.assign(Object.assign({}, goal), { keyResults: goal.keyResults.map((kr) => (Object.assign(Object.assign({}, kr), { fact: calcFact(kr) }))) }))) })));
    res.json(okrsWithFact);
}));
// Дублирование цели вместе с KR
router.post('/goal/:goalId/duplicate', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { goalId } = req.params;
    const goal = yield prisma.goal.findUnique({
        where: { id: goalId },
        include: { okr: true, keyResults: true },
    });
    if (!goal || goal.okr.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    const lastGoal = yield prisma.goal.findFirst({ where: { okrId: goal.okrId }, orderBy: { order: 'desc' } });
    const newOrder = lastGoal ? lastGoal.order + 1 : 0;
    const newGoal = yield prisma.goal.create({
        data: {
            okrId: goal.okrId,
            title: goal.title + ' (копия)',
            keyInitiatives: goal.keyInitiatives,
            order: newOrder,
            keyResults: {
                create: goal.keyResults.map((kr, idx) => ({
                    title: kr.title,
                    metric: kr.metric,
                    base: kr.base,
                    plan: kr.plan,
                    formula: kr.formula,
                    order: idx,
                })),
            },
        },
        include: { keyResults: true },
    });
    res.status(201).json(newGoal);
}));
// Дублирование ключевого результата
router.post('/goal/:goalId/keyresult/:krId/duplicate', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { goalId, krId } = req.params;
    const goal = yield prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } });
    const kr = yield prisma.keyResult.findUnique({ where: { id: krId } });
    if (!goal || !kr || goal.okr.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    const lastKR = yield prisma.keyResult.findFirst({ where: { goalId }, orderBy: { order: 'desc' } });
    const newOrder = lastKR ? lastKR.order + 1 : 0;
    const newKR = yield prisma.keyResult.create({
        data: {
            goalId,
            title: kr.title + ' (копия)',
            metric: kr.metric,
            base: kr.base,
            plan: kr.plan,
            formula: kr.formula,
            order: newOrder,
        },
    });
    res.status(201).json(newKR);
}));
// Обновить комментарий KR
router.patch('/goal/:goalId/keyresult/:krId/comment', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { goalId, krId } = req.params;
    const { comment } = req.body;
    const kr = yield prisma.keyResult.findUnique({ where: { id: krId }, include: { goal: { include: { okr: true } } } });
    if (!kr || kr.goalId !== goalId || kr.goal.okr.userId !== req.user.userId || kr.goal.okr.archived) {
        return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
    }
    const updated = yield prisma.keyResult.update({ where: { id: krId }, data: { comment } });
    res.json(updated);
}));
// Смена порядка целей внутри OKR
router.post('/:id/reorder-goals', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { goalIds } = req.body; // массив id целей в новом порядке
    const okr = yield prisma.oKR.findUnique({ where: { id } });
    if (!okr || okr.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    for (let i = 0; i < goalIds.length; i++) {
        yield prisma.goal.update({ where: { id: goalIds[i] }, data: { order: i } });
    }
    res.json({ success: true });
}));
// Смена порядка KR внутри цели
router.post('/goal/:goalId/reorder-keyresults', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { goalId } = req.params;
    const { krIds } = req.body; // массив id KR в новом порядке
    const goal = yield prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } });
    if (!goal || goal.okr.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    for (let i = 0; i < krIds.length; i++) {
        yield prisma.keyResult.update({ where: { id: krIds[i] }, data: { order: i } });
    }
    res.json({ success: true });
}));
// Удалить OKR
router.delete('/:id', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const okr = yield prisma.oKR.findUnique({ where: { id } });
    if (!okr || okr.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    try {
        // Удалить все связанные записи в правильном порядке
        const goals = yield prisma.goal.findMany({ where: { okrId: id } });
        for (const goal of goals) {
            // Сначала удаляем weeklyMonitoring для всех KR этой цели
            const keyResults = yield prisma.keyResult.findMany({ where: { goalId: goal.id } });
            for (const kr of keyResults) {
                yield prisma.weeklyMonitoringEntry.deleteMany({ where: { keyResultId: kr.id } });
            }
            // Затем удаляем сами KR
            yield prisma.keyResult.deleteMany({ where: { goalId: goal.id } });
        }
        // Удаляем цели
        yield prisma.goal.deleteMany({ where: { okrId: id } });
        // Удаляем сам OKR
        yield prisma.oKR.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Ошибка при удалении OKR:', error);
        res.status(500).json({ error: 'Ошибка при удалении OKR' });
    }
}));
// Archive/Unarchive OKR
router.patch('/:id/archive', middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { archived } = req.body;
    // Check if OKR exists and belongs to user
    const okr = yield prisma.oKR.findUnique({
        where: { id },
    });
    if (!okr) {
        return res.status(404).json({ error: 'OKR не найден' });
    }
    if (okr.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    // Update the archived status
    const updatedOkr = yield prisma.oKR.update({
        where: { id },
        data: { archived: archived === true },
    });
    res.json(updatedOkr);
}));
exports.default = router;
