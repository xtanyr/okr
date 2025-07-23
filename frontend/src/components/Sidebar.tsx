import React from 'react';
import { Box, Avatar, Typography, Stack, Divider, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useUserStore, getUserAvatar } from '../store/userStore';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const menuItems = [
  { text: 'OKR', icon: <DashboardIcon />, path: '/' },
  { text: 'Пользователи', icon: <PeopleIcon />, path: '/users' },
  { text: 'Профиль', icon: <AssignmentIcon />, path: '/profile' },
];

const Sidebar = () => {
  const user = useUserStore(state => state.user);
  const logout = useUserStore(state => state.logout);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatar = getUserAvatar(user.firstName, user.lastName, user.id || user.email);

  const drawer = (
    <Box p={3} minWidth={220} bgcolor="#fff" height="100vh" display="flex" flexDirection="column" justifyContent="space-between">
      <Stack alignItems="center" spacing={2} mb={4}>
        <Avatar sx={{ bgcolor: avatar.color, width: 64, height: 64, fontSize: 32 }}>{avatar.initials}</Avatar>
        <Typography fontWeight={700} fontSize={18}>{user.firstName} {user.lastName}</Typography>
      </Stack>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.path} sx={{ borderRadius: 8, mb: 1, '&.Mui-selected': { bgcolor: '#f7f9fb', color: '#2563eb' } }}>
              <ListItemIcon sx={{ color: '#2563eb' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem key="logout" disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 8, mt: 2 }}>
            <ListItemIcon sx={{ color: '#e53935' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Выйти" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Box display={{ xs: 'block', md: 'none' }}>
        <IconButton onClick={() => setOpen(true)}>
          <MenuIcon />
        </IconButton>
        <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
          {drawer}
        </Drawer>
      </Box>
      <Box p={0} minHeight="100vh" bgcolor="#fff" borderRadius={3} boxShadow={1} display={{ xs: 'none', md: 'block' }}>
        {drawer}
      </Box>
    </>
  );
};

export default Sidebar; 