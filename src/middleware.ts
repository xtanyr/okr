import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Нет авторизации' });
  }
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Неверный токен' });
  }
} 