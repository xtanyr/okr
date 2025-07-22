import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from './middleware';

const prisma = new PrismaClient();
const router = Router();

// Middleware для проверки роли admin
function requireAdmin(req: AuthRequest, res: any, next: any) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Требуется роль администратора' });
  }
  next();
}

// Получить свой профиль
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(user);
});

// Получить список всех пользователей (только просмотр)
router.get('/all', requireAuth, async (req: AuthRequest, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
  res.json(users);
});

// Удалить пользователя (только admin)
router.delete('/:userId', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { userId } = req.params;
  await prisma.user.delete({ where: { id: userId } });
  res.json({ success: true });
});

export default router; 