import React from 'react';
import { Box, Stack, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';

const menuItems = [
  { text: 'OKR', icon: <DashboardIcon /> },
  { text: 'Пользователи', icon: <PeopleIcon /> },
  { text: 'Профиль', icon: <AssignmentIcon /> },
  { text: 'Выйти', icon: <LogoutIcon /> },
];

const Sidebar: React.FC = () => (
  <Box sx={{ width: 220, height: '100vh', bgcolor: '#fff', boxShadow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, position: 'fixed', left: 0, top: 0, zIndex: 100 }}>
    {/* Логотип OKR Lab */}
    <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ mb: 4, letterSpacing: 1 }}>
      OKR Lab
    </Typography>
    <List sx={{ width: '100%' }}>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Box>
);

export default Sidebar; 