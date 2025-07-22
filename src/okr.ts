import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from './middleware';

const prisma = new PrismaClient();
const router = Router();

// Вспомогательная функция для расчёта 'факт' по формуле
function calcFact(kr: any) {
  const values = (kr.weeklyMonitoring || []).map((w: any) => w.value as number);
  const base = kr.base || 0;
  if (!values.length) return 0;
  switch ((kr.formula || '').toLowerCase()) {
    case 'макс':
      return Math.max(...values);
    case 'среднее':
      return values.reduce((a: number, b: number) => a + b, 0) / values.length;
    case 'текущее':
      return values[values.length - 1];
    case 'мин':
      return Math.min(...values);
    case 'сумма':
      return values.reduce((a: number, b: number) => a + b, 0);
    case 'макс без базы':
      return Math.max(...values) - base;
    case 'среднее без базы':
      return values.reduce((a: number, b: number) => a + b, 0) / values.length - base;
    case 'текущее без базы':
      return values[values.length - 1] - base;
    case 'минимум без базы':
      return Math.min(...values) - base;
    case 'сумма без базы':
      return values.reduce((a: number, b: number) => a + b, 0) - base;
    default:
      return Math.max(...values); // по умолчанию макс
  }
}

// Получить все OKR текущего пользователя
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const okrs = await prisma.oKR.findMany({
    where: { userId: req.user!.userId },
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
  const okrsWithFact = okrs.map((okr: any) => ({
    ...okr,
    goals: okr.goals.map((goal: any) => ({
      ...goal,
      keyResults: goal.keyResults.map((kr: any) => ({
        ...kr,
        fact: calcFact(kr),
      })),
    })),
  }));
  res.json(okrsWithFact);
});

// Создать OKR
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { period } = req.body;
  if (!period) {
    return res.status(400).json({ error: 'Период обязателен' });
  }
  const okr = await prisma.oKR.create({
    data: {
      userId: req.user!.userId,
      period,
      archived: false,
    },
  });
  res.status(201).json(okr);
});

// Обновить OKR (только если не архивирован и принадлежит пользователю)
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const okr = await prisma.oKR.findUnique({ where: { id } });
  if (!okr || okr.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  if (okr.archived) {
    return res.status(400).json({ error: 'OKR в архиве' });
  }
  const { period, archived } = req.body;
  const updated = await prisma.oKR.update({
    where: { id },
    data: { period, archived },
  });
  res.json(updated);
});

// Архивировать OKR
router.post('/:id/archive', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const okr = await prisma.oKR.findUnique({ where: { id } });
  if (!okr || okr.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  const updated = await prisma.oKR.update({
    where: { id },
    data: { archived: true },
  });
  res.json(updated);
});

// Дублирование OKR вместе с целями и KR
router.post('/:id/duplicate', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const okr = await prisma.oKR.findUnique({
    where: { id },
    include: {
      goals: {
        include: {
          keyResults: true,
        },
      },
    },
  });
  if (!okr || okr.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  const newOKR = await prisma.oKR.create({
    data: {
      userId: okr.userId,
      period: okr.period + ' (копия)',
      archived: false,
      goals: {
        create: okr.goals.map((goal: any) => ({
          title: goal.title,
          keyInitiatives: goal.keyInitiatives,
          keyResults: {
            create: goal.keyResults.map((kr: any) => ({
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
});

// Добавить цель в OKR
router.post('/:okrId/goal', requireAuth, async (req: AuthRequest, res) => {
  const { okrId } = req.params;
  const { title, keyInitiatives } = req.body;
  const okr = await prisma.oKR.findUnique({ where: { id: okrId } });
  if (!okr || okr.userId !== req.user!.userId || okr.archived) {
    return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
  }
  const lastGoal = await prisma.goal.findFirst({ where: { okrId }, orderBy: { order: 'desc' } });
  const newOrder = lastGoal ? lastGoal.order + 1 : 0;
  const goal = await prisma.goal.create({
    data: {
      okrId,
      title,
      keyInitiatives: keyInitiatives || '',
      order: newOrder,
    },
  });
  res.status(201).json(goal);
});

// Обновить цель (в т.ч. ключевые инициативы)
router.put('/:okrId/goal/:goalId', requireAuth, async (req: AuthRequest, res) => {
  const { okrId, goalId } = req.params;
  const { title, keyInitiatives } = req.body;
  const okr = await prisma.oKR.findUnique({ where: { id: okrId } });
  if (!okr || okr.userId !== req.user!.userId || okr.archived) {
    return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
  }
  const goal = await prisma.goal.update({
    where: { id: goalId },
    data: { title, keyInitiatives },
  });
  res.json(goal); // goal содержит order
});

// Удалить цель
router.delete('/:okrId/goal/:goalId', requireAuth, async (req: AuthRequest, res) => {
  const { okrId, goalId } = req.params;
  const okr = await prisma.oKR.findUnique({ where: { id: okrId } });
  if (!okr || okr.userId !== req.user!.userId || okr.archived) {
    return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
  }
  const keyResults = await prisma.keyResult.findMany({ where: { goalId } });
  for (const kr of keyResults) {
    await prisma.weeklyMonitoringEntry.deleteMany({ where: { keyResultId: kr.id } });
  }
  await prisma.keyResult.deleteMany({ where: { goalId } });
  await prisma.goal.delete({ where: { id: goalId } });
  res.json({ success: true });
});

// Добавить ключевой результат в цель
router.post('/goal/:goalId/keyresult', requireAuth, async (req: AuthRequest, res) => {
  const { goalId } = req.params;
  const { title, metric, base, plan, formula } = req.body;
  const goal = await prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } });
  if (!goal || goal.okr.userId !== req.user!.userId || goal.okr.archived) {
    return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
  }
  const lastKR = await prisma.keyResult.findFirst({ where: { goalId }, orderBy: { order: 'desc' } });
  const newOrder = lastKR ? lastKR.order + 1 : 0;
  const kr = await prisma.keyResult.create({
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
});

// Обновить ключевой результат
router.put('/goal/:goalId/keyresult/:krId', requireAuth, async (req: AuthRequest, res) => {
  const { goalId, krId } = req.params;
  const { title, metric, base, plan, formula } = req.body;
  const goal = await prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } });
  if (!goal || goal.okr.userId !== req.user!.userId || goal.okr.archived) {
    return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
  }
  const kr = await prisma.keyResult.update({
    where: { id: krId },
    data: { title, metric, base, plan, formula },
  });
  res.json(kr);
});

// Удалить ключевой результат
router.delete('/goal/:goalId/keyresult/:krId', requireAuth, async (req: AuthRequest, res) => {
  const { goalId, krId } = req.params;
  const goal = await prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } });
  if (!goal || goal.okr.userId !== req.user!.userId || goal.okr.archived) {
    return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
  }
  await prisma.keyResult.delete({ where: { id: krId } });
  res.json({ success: true });
});

// Добавить/обновить значение недельного мониторинга
router.post('/keyresult/:krId/monitoring', requireAuth, async (req: AuthRequest, res) => {
  const { krId } = req.params;
  const { weekNumber, value } = req.body;
  const kr = await prisma.keyResult.findUnique({ where: { id: krId }, include: { goal: { include: { okr: true } } } });
  if (!kr || kr.goal.okr.userId !== req.user!.userId || kr.goal.okr.archived) {
    return res.status(403).json({ error: 'Нет доступа или OKR в архиве' });
  }
  // upsert: если запись за неделю есть — обновить, иначе создать
  const entry = await prisma.weeklyMonitoringEntry.upsert({
    where: { keyResultId_weekNumber: { keyResultId: krId, weekNumber } },
    update: { value },
    create: { keyResultId: krId, weekNumber, value },
  });
  res.json(entry);
});

// Получить значения недельного мониторинга по KR
router.get('/keyresult/:krId/monitoring', requireAuth, async (req: AuthRequest, res) => {
  const { krId } = req.params;
  const kr = await prisma.keyResult.findUnique({ where: { id: krId }, include: { goal: { include: { okr: true } } } });
  if (!kr || kr.goal.okr.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  const entries = await prisma.weeklyMonitoringEntry.findMany({ where: { keyResultId: krId } });
  res.json(entries);
});

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

router.get('/dictionaries', requireAuth, (req, res) => {
  res.json({ formulas: FORMULAS, metrics: METRICS });
});

// Просмотр OKR другого пользователя (только чтение)
router.get('/user/:userId', requireAuth, async (req: AuthRequest, res) => {
  const { userId } = req.params;
  const okrs = await prisma.oKR.findMany({
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
  // Добавляем вычисление 'факт' для каждого KR
  const okrsWithFact = okrs.map((okr: any) => ({
    ...okr,
    goals: okr.goals.map((goal: any) => ({
      ...goal,
      keyResults: goal.keyResults.map((kr: any) => ({
        ...kr,
        fact: calcFact(kr),
      })),
    })),
  }));
  res.json(okrsWithFact);
});

// Дублирование цели вместе с KR
router.post('/goal/:goalId/duplicate', requireAuth, async (req: AuthRequest, res) => {
  const { goalId } = req.params;
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { okr: true, keyResults: true },
  });
  if (!goal || goal.okr.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  const lastGoal = await prisma.goal.findFirst({ where: { okrId: goal.okrId }, orderBy: { order: 'desc' } });
  const newOrder = lastGoal ? lastGoal.order + 1 : 0;
  const newGoal = await prisma.goal.create({
    data: {
      okrId: goal.okrId,
      title: goal.title + ' (копия)',
      keyInitiatives: goal.keyInitiatives,
      order: newOrder,
      keyResults: {
        create: goal.keyResults.map((kr: any, idx: number) => ({
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
});

// Дублирование ключевого результата
router.post('/goal/:goalId/keyresult/:krId/duplicate', requireAuth, async (req: AuthRequest, res) => {
  const { goalId, krId } = req.params;
  const goal = await prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } });
  const kr = await prisma.keyResult.findUnique({ where: { id: krId } });
  if (!goal || !kr || goal.okr.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  const lastKR = await prisma.keyResult.findFirst({ where: { goalId }, orderBy: { order: 'desc' } });
  const newOrder = lastKR ? lastKR.order + 1 : 0;
  const newKR = await prisma.keyResult.create({
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
});

// Смена порядка целей внутри OKR
router.post('/:id/reorder-goals', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { goalIds } = req.body; // массив id целей в новом порядке
  const okr = await prisma.oKR.findUnique({ where: { id } });
  if (!okr || okr.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  for (let i = 0; i < goalIds.length; i++) {
    await prisma.goal.update({ where: { id: goalIds[i] }, data: { order: i } });
  }
  res.json({ success: true });
});

// Смена порядка KR внутри цели
router.post('/goal/:goalId/reorder-keyresults', requireAuth, async (req: AuthRequest, res) => {
  const { goalId } = req.params;
  const { krIds } = req.body; // массив id KR в новом порядке
  const goal = await prisma.goal.findUnique({ where: { id: goalId }, include: { okr: true } });
  if (!goal || goal.okr.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  for (let i = 0; i < krIds.length; i++) {
    await prisma.keyResult.update({ where: { id: krIds[i] }, data: { order: i } });
  }
  res.json({ success: true });
});

// Удалить OKR
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const okr = await prisma.oKR.findUnique({ where: { id } });
  if (!okr || okr.userId !== req.user!.userId) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  // Удалить все связанные keyResults и goals
  const goals = await prisma.goal.findMany({ where: { okrId: id } });
  for (const goal of goals) {
    await prisma.keyResult.deleteMany({ where: { goalId: goal.id } });
  }
  await prisma.goal.deleteMany({ where: { okrId: id } });
  await prisma.oKR.delete({ where: { id } });
  res.json({ success: true });
});

export default router; 