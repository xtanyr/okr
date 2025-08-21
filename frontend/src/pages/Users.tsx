import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Stack, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button,
  Tooltip
} from '@mui/material';
import { Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';
import { getUserAvatar, useUserStore } from '../store/userStore';
import { toast } from 'react-toastify';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { user: currentUser } = useUserStore();
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    axios.get('/user/all')
      .then(res => setUsers(res.data))
      .catch(e => setError(e.response?.data?.error || 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await axios.delete(`/user/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setUsers(users.filter(u => u.id !== userToDelete.id));
      toast.success('Пользователь удален');
    } catch (error) {
      toast.error('Ошибка при удалении пользователя');
      console.error('Error deleting user:', error);
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => window.history.back()} 
          color="primary" 
          sx={{ 
            border: '1px solid', 
            borderColor: 'divider',
            '&:hover': { 
              bgcolor: 'action.hover' 
            } 
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          Все пользователи
        </Typography>
      </Box>
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
                {isAdmin && <TableCell align="right">Действия</TableCell>}
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
                    {isAdmin && (
                      <TableCell align="right">
                        {u.id !== currentUser?.id && (
                          <Tooltip title="Удалить пользователя">
                            <IconButton 
                              onClick={() => handleDeleteClick(u)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить пользователя {userToDelete?.firstName} {userToDelete?.lastName} ({userToDelete?.email})?
            Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Отмена
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users; 