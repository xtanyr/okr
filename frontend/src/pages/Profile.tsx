import React, { useState } from 'react';
import { Box, Avatar, Typography, Stack, Button, Paper, TextField, Alert, Divider, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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

  const handleBack = () => {
    navigate('/dashboard');
  };

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
    <Box maxWidth={800} mx="auto" p={3} width="100%">
      <Box maxWidth={600} mx="auto" width="100%">
        <Box display="flex" alignItems="center" mb={4}>
          <IconButton 
            onClick={handleBack}
            sx={{ mr: 2 }}
            aria-label="Вернуться"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            OKR
          </Typography>
        </Box>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%' }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                fontSize: '2.5rem',
                bgcolor: avatar.color,
                mb: 2,
              }}
            >
              {avatar.initials}
            </Avatar>
            <Typography variant="h6" component="h2" align="center">
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              {user.email}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" width="100%" mb={4}>
            <Button variant="outlined" color="error" onClick={handleLogout} sx={{ borderRadius: 2, fontWeight: 600, minWidth: 200 }}>
              Выйти из аккаунта
            </Button>
          </Box>
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
    </Box>
  );
};

export default Profile;