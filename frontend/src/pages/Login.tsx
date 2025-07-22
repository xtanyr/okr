import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useUserStore } from '../store/userStore';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit } = useForm<LoginForm>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const login = useUserStore((s) => s.login);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/auth/login', data);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'background.default' }}>
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2} align="center" color="primary.main">
            Вход в OKR Lab
          </Typography>
          <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField label="Email" type="email" fullWidth required autoFocus {...register('email')} />
            <TextField label="Пароль" type="password" fullWidth required {...register('password')} />
            {error && <Alert severity="error">{error}</Alert>}
            <Button variant="contained" size="large" fullWidth sx={{ mt: 1 }} type="submit" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
            <Typography variant="body2" align="center" color="text.secondary">
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
} 