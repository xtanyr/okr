import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from './email';

const prisma = new PrismaClient();
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const REGISTRATION_CODE = process.env.REGISTRATION_CODE || 'okr2025';

// Генерация аватарки: первые две буквы имени + случайный фон (цвет)
function generateAvatar(name: string) {
  const initials = name.slice(0, 2).toUpperCase();
  const colors = ['#FFB300', '#1E88E5', '#43A047', '#E53935', '#8E24AA', '#F4511E'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return { initials, color };
}

// Регистрация
router.post('/register', async (req, res) => {
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

// Password reset request
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Error processing password reset request' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
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
    const user = await prisma.user.findFirst({
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
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

export default router; 
