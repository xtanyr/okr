import React from 'react';
import { AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, IconButton, ListItemButton, Avatar, Menu, MenuItem } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme, useMediaQuery } from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const drawerWidth = 220;

const menuItems = [
  { text: 'OKR', icon: <DashboardIcon />, path: '/' },
  { text: 'Пользователи', icon: <PeopleIcon />, path: 'users' },
  { text: 'Профиль', icon: <AssignmentIcon />, path: 'profile' },
];

export default function Layout({ children }: { children?: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const [desktopOpen, setDesktopOpen] = React.useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
    setAnchorEl(null);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen((prev) => !prev);
  };

  const drawer = (
    <div>
      <Toolbar sx={{ minHeight: 64 }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem key="logout" disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Выйти" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'background.default' }}>
      <CssBaseline />
      {/* Sidebar для мобильных */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
      >
        {drawer}
      </Drawer>
      {/* Sidebar для ПК с возможностью скрытия */}
      <Drawer
        variant="persistent"
        open={desktopOpen && isDesktop}
        sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
      >
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={handleDesktopDrawerToggle} size="small">
            <MenuIcon />
          </IconButton>
        </Box>
        {drawer}
      </Drawer>
      {/* Кнопка-гамбургер для ПК */}
      {isDesktop && !desktopOpen && (
        <IconButton
          color="primary"
          onClick={handleDesktopDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 2,
            display: { xs: 'none', sm: 'inline-flex' },
            background: 'white',
            boxShadow: 1,
            borderRadius: 2,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${desktopOpen && isDesktop ? drawerWidth : 0}px)` }, background: 'background.default', minHeight: '100vh', transition: 'margin-left 0.3s', ml: { sm: desktopOpen && isDesktop ? `${drawerWidth}px` : 0 } }}>
        <Toolbar sx={{ minHeight: 64 }} />
        {children || <Outlet />}
      </Box>
    </Box>
  );
} 