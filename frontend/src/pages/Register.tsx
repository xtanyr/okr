import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useUserStore } from '../store/userStore';

interface RegisterForm {
  email: string;
  password: string;
  passwordConfirm: string;
  lastName: string;
  firstName: string;
}

export default function Register() {
  const { register, handleSubmit } = useForm<RegisterForm>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const registerUser = useUserStore((s) => s.register);
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/auth/register', data);
      registerUser(res.data.user, res.data.token);
      navigate('/');
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || e.toString() || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'background.default' }}>
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2} align="center" color="primary.main">
            Регистрация в OKR Lab
          </Typography>
          <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField label="Email" type="email" fullWidth required autoFocus {...register('email')} />
            <TextField label="Пароль" type="password" fullWidth required {...register('password')} />
            <TextField label="Подтверждение пароля" type="password" fullWidth required {...register('passwordConfirm')} />
            <TextField label="Фамилия" fullWidth required {...register('lastName')} />
            <TextField label="Имя" fullWidth required {...register('firstName')} />
            {error && <Alert severity="error">{error}</Alert>}
            <Button variant="contained" size="large" fullWidth sx={{ mt: 1 }} type="submit" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            <Typography variant="body2" align="center" color="text.secondary">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
} 