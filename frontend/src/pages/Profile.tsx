import React, { useState } from 'react';
import { Box, Avatar, Typography, Stack, Button, Paper, TextField, Alert, Divider } from '@mui/material';
import { useUserStore, getUserAvatar } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const setUser = useUserStore((s) => s.setUser);
  const navigate = useNavigate();

  // Состояния для формы имени
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Состояния для формы пароля
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  if (!user) return null;

  const avatar = getUserAvatar(user.firstName, user.lastName, user.id || user.email);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameLoading(true);
    setNameError(null);
    setNameSuccess(false);
    try {
      const res = await axios.patch('/user/me', { firstName, lastName });
      setUser({ ...user, firstName: res.data.firstName, lastName: res.data.lastName });
      setNameSuccess(true);
    } catch (e: any) {
      setNameError(e.response?.data?.error || 'Ошибка обновления профиля');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError(null);
    setPassSuccess(false);
    try {
      await axios.post('/user/change-password', { oldPassword, newPassword, newPasswordConfirm });
      setPassSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (e: any) {
      setPassError(e.response?.data?.error || 'Ошибка смены пароля');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh" px={2}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, maxWidth: 420, width: '100%' }}>
        <Stack alignItems="center" spacing={3}>
          <Avatar sx={{ bgcolor: avatar.color, width: 80, height: 80, fontSize: 36 }}>
            {avatar.initials}
          </Avatar>
          <Typography variant="h5" fontWeight={700} textAlign="center">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography color="text.secondary" fontSize={16} textAlign="center">
            {user.email}
          </Typography>
          <Button variant="outlined" color="error" onClick={handleLogout} sx={{ borderRadius: 2, fontWeight: 600, minWidth: 160 }}>
            Выйти из аккаунта
          </Button>
        </Stack>
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" fontWeight={600} mb={2}>
          Редактировать профиль
        </Typography>
        <form onSubmit={handleNameSubmit}>
          <Stack spacing={2}>
            <TextField label="Имя" value={firstName} onChange={e => setFirstName(e.target.value)} required fullWidth disabled={nameLoading} />
            <TextField label="Фамилия" value={lastName} onChange={e => setLastName(e.target.value)} required fullWidth disabled={nameLoading} />
            {nameError && <Alert severity="error">{nameError}</Alert>}
            {nameSuccess && <Alert severity="success">Профиль обновлён</Alert>}
            <Button type="submit" variant="contained" disabled={nameLoading || (!firstName.trim() || !lastName.trim())} sx={{ fontWeight: 600 }}>
              {nameLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </Stack>
        </form>
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" fontWeight={600} mb={2}>
          Сменить пароль
        </Typography>
        <form onSubmit={handlePasswordSubmit}>
          <Stack spacing={2}>
            <TextField label="Старый пароль" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required fullWidth disabled={passLoading} />
            <TextField label="Новый пароль" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required fullWidth disabled={passLoading} />
            <TextField label="Повторите новый пароль" type="password" value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)} required fullWidth disabled={passLoading} />
            {passError && <Alert severity="error">{passError}</Alert>}
            {passSuccess && <Alert severity="success">Пароль успешно изменён</Alert>}
            <Button type="submit" variant="contained" color="primary" disabled={passLoading || !oldPassword || !newPassword || !newPasswordConfirm} sx={{ fontWeight: 600 }}>
              {passLoading ? 'Смена...' : 'Сменить пароль'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile; 