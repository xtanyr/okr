import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Генерация аватарки: первые две буквы имени + случайный фон (цвет)
function generateAvatar(name: string) {
  const initials = name.slice(0, 2).toUpperCase();
  const colors = ['#FFB300', '#1E88E5', '#43A047', '#E53935', '#8E24AA', '#F4511E'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return { initials, color };
}

// Регистрация
router.post('/register', async (req, res) => {
  const { email, password, passwordConfirm, firstName, lastName } = req.body;
  if (!email || !password || !passwordConfirm || !firstName || !lastName) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  if (password !== passwordConfirm) {
    return res.status(400).json({ error: 'Пароли не совпадают' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      firstName,
      lastName,
      role: 'USER',
    },
  });
  const avatar = generateAvatar(firstName);
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, firstName, lastName, role: user.role, avatar } });
});

// Логин
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: 'Неверный email или пароль' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ error: 'Неверный email или пароль' });
  }
  const avatar = generateAvatar(user.firstName);
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, avatar } });
});

export default router; 