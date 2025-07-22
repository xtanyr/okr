import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRouter from './auth';
import userRouter from './user';
import okrRouter from './okr';
import { Request, Response, NextFunction } from 'express';

// Инициализация переменных окружения
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/okr', okrRouter);

// ErrorHandler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 