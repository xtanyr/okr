import { Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useUserStore } from '../store/userStore';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'OKR', icon: <DashboardIcon />, path: '/' },
  { text: 'Пользователи', icon: <PeopleIcon />, path: '/users' },
  { text: 'Профиль', icon: <AssignmentIcon />, path: '/profile' },
];

const Sidebar = () => {
  const user = useUserStore(state => state.user);
  const logout = useUserStore(state => state.logout);
  // Initialize state from localStorage or default to false
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved === 'true';
    }
    return false;
  });

  // Save to localStorage whenever collapsed state changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, [collapsed]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{
      width: collapsed ? 80 : 240,
      minWidth: collapsed ? 80 : 240,
      maxWidth: collapsed ? 80 : 240,
      height: '100vh',
      bgcolor: '#fff',
      boxShadow: '0 0 10px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: 0,
      p: 0,
      overflow: 'hidden',
      position: 'relative',
      '&:after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: 'rgba(0,0,0,0.08)',
      }
    }}>
      <Box sx={{ flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '64px',
          minHeight: '64px',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.02)'
          }
        }}>
          <IconButton 
            size="small" 
            onClick={() => setCollapsed(v => !v)} 
            sx={{ 
              position: 'absolute',
              right: collapsed ? '50%' : 16,
              transform: collapsed ? 'translateX(50%)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            <MenuIcon sx={{ 
              transform: collapsed ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.3s',
              color: 'text.secondary'
            }} />
          </IconButton>
        </Box>
        {/* Имя и аватарка пользователя убраны по требованию */}
        <List sx={{ 
          px: 1,
          width: '100%',
          '& .MuiListItem-root': {
            width: 'calc(100% - 8px)',
            mx: 'auto',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          },
          '& .MuiListItemButton-root': {
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }
        }}>
          {menuItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={selected}
                  sx={{
                    borderRadius: 10,
                    px: collapsed ? 1.5 : 2.5,
                    py: 1.2,
                    minHeight: 44,
                    color: selected ? '#fff' : '#111',
                    bgcolor: selected ? '#000' : 'transparent',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: selected ? '#000' : '#f2f2f2', color: selected ? '#fff' : '#111' },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon sx={{ color: selected ? '#fff' : '#111', minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center', transition: 'color 0.2s' }}>{item.icon}</ListItemIcon>
                  {!collapsed && <ListItemText primary={item.text} primaryTypographyProps={{ sx: { color: selected ? '#fff' : '#111', fontWeight: 600, transition: 'color 0.2s' } }} sx={{ opacity: 1 }} />}
                </ListItemButton>
              </ListItem>
            );
          })}
          {/* Кнопка выхода */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 10,
                px: collapsed ? 1.5 : 2.5,
                py: 1.2,
                minHeight: 44,
                color: '#111',
                bgcolor: 'transparent',
                '&:hover': { bgcolor: '#f2f2f2', color: '#111' },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{ color: '#111', minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}><LogoutIcon fontSize="small" /></ListItemIcon>
              {!collapsed && <ListItemText primary="Выйти" sx={{ color: '#111', opacity: 1, transition: 'opacity 0.2s, color 0.2s' }} />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Мобильное меню */}
      <Box display={{ xs: 'block', md: 'none' }}>
        <IconButton onClick={() => setMobileOpen(true)} sx={{ m: 1 }}>
          <MenuIcon />
        </IconButton>
        <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: 240, borderRadius: 0 } }}>
          {drawerContent}
        </Drawer>
      </Box>
      {/* Десктоп меню */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          minHeight: '100vh',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: collapsed ? 80 : 240,
          minWidth: collapsed ? 80 : 240,
          maxWidth: collapsed ? 80 : 240,
          bgcolor: '#fff',
          borderRadius: 0,
          position: 'relative',
          flexShrink: 0,
          zIndex: 1100,
          '&:hover': {
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
          }
        }}
      >
        {drawerContent}
      </Box>
    </>
  );
};

export default Sidebar; 