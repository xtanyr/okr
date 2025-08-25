import React, { useState } from 'react';
import { Box, Avatar, Typography, Stack, Button, Paper, TextField, Alert, Divider, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useUserStore, getUserAvatar } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StarBackground from '../components/StarBackground';

const Profile: React.FC = () => {
  const user = useUserStore((s) => s.user);
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

  // Add global styles to remove default margins and padding
  React.useEffect(() => {
    // Add custom styles to override MUI Container padding
    const style = document.createElement('style');
    style.textContent = `
      .profile-root {
        padding: 0 !important;
      }
      @media (min-width: 0px) {
        .css-1bzq6gc {
          padding: 0 !important;
        }
      }
      @media (min-width: 600px) {
        .css-1bzq6gc {
          padding: 0 !important;
        }
      }
      @media (min-width: 900px) {
        .css-1bzq6gc {
          padding: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflowX = 'hidden';
    
    return () => {
      document.head.removeChild(style);
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflowX = '';
    };
  }, []);

  return (
    <Box className="profile-root" sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '120vh',
      width: '100vw',
      margin: 0,
      padding: '0 !important',
      '& > *': {
        maxWidth: '100%',
        boxSizing: 'border-box'
      }
    }}>
      <Box maxWidth={800} mx="auto" p={3} width="100%" sx={{ flex: 1 }}>
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
      
      {/* Full-width footer with snowflakes */}
      <Box 
        component="footer"
        sx={{
          width: '100vw',
          position: 'static',
          margin: 0,
          padding: 0,
          zIndex: 1000,
          '&::before': {
            content: '""',
            position: 'relative',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgb(160, 216, 240), rgb(160, 216, 240), transparent)',
            zIndex: 1002
          },
        }}
      >
        <Box 
          sx={{
            position: 'relative',
            width: '100vw',
            margin: 0,
            padding: 0,
            background: 'linear-gradient(135deg, rgba(255, 155, 200, 0.25), rgba(255, 200, 230, 0.15))',
            backdropFilter: 'blur(5px)',
            p: 3,
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'rgba(255, 200, 230, 0.4)',
            overflow: 'hidden',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 50% 0%, rgba(255, 200, 230, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0
            },
          }}
        >
          <Box position="absolute" top={0} left={0} right={0} bottom={0} overflow="hidden" zIndex={1}>
            <StarBackground />
          </Box>
          <Box position="relative" zIndex={1}>
            <Typography 
              variant="h6" 
              sx={{
                color: 'rgba(0, 0, 0, 0.9)',
                fontWeight: 700,
                letterSpacing: '1px',
                mb: 1,
                fontSize: '1.25rem',
                textAlign: 'center',
                textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)'
              }}
            >
              xtany dev
            </Typography>
          </Box>
          <Typography 
            variant="caption" 
            sx={{
              display: 'block',
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: '0.75rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              textAlign: 'center',
              position: 'relative',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
              '&::before, &::after': {
                content: '"✧"',
                display: 'inline-block',
                mx: 1,
                color: 'rgba(0, 0, 0, 0.6)'
              }
            }}
          >
          {new Date().getFullYear()} skuratov team
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;