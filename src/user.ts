import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from './middleware';
import bcrypt from 'bcrypt';

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

// Обновить имя/фамилию пользователя
router.patch('/me', requireAuth, async (req: AuthRequest, res) => {
  const { firstName, lastName } = req.body;
  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Имя и фамилия обязательны' });
  }
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { firstName, lastName },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
  res.json(user);
});

// Сменить пароль пользователя
router.post('/change-password', requireAuth, async (req: AuthRequest, res) => {
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;
  if (!oldPassword || !newPassword || !newPasswordConfirm) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  if (newPassword !== newPasswordConfirm) {
    return res.status(400).json({ error: 'Пароли не совпадают' });
  }
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) {
    return res.status(400).json({ error: 'Старый пароль неверен' });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: req.user!.userId }, data: { password: hash } });
  res.json({ success: true });
});

// Удалить пользователя (только admin)
router.delete('/:userId', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { userId } = req.params;
  await prisma.user.delete({ where: { id: userId } });
  res.json({ success: true });
});

export default router; 