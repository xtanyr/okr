import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Avatar, Stack, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';
import { getUserAvatar } from '../store/userStore';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/user/all')
      .then(res => setUsers(res.data))
      .catch(e => setError(e.response?.data?.error || 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Все пользователи
      </Typography>
      {loading ? (
        <Stack alignItems="center" py={8}><CircularProgress /></Stack>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Аватар</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Роль</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => {
                const avatar = getUserAvatar(u.firstName, u.lastName, u.id || u.email);
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Avatar sx={{ bgcolor: avatar.color, width: 40, height: 40, fontSize: 18 }}>{avatar.initials}</Avatar>
                    </TableCell>
                    <TableCell>{u.firstName} {u.lastName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Users; 