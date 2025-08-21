import React from 'react';
import { Avatar, Divider, IconButton, Menu, MenuItem, Typography, Box, ListItemIcon } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
import { useUserStore, getUserAvatar } from '../store/userStore';

interface UserAvatarProps {
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ size = 40 }) => {
  const user = useUserStore(state => state.user);
  const logout = useUserStore(state => state.logout);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  if (!user) return null;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleUsersClick = () => {
    handleMenuClose();
    navigate('/users');
  };

  const avatar = getUserAvatar(user.firstName, user.lastName, user.id || user.email);
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        size="small"
        sx={{ p: 0 }}
        aria-label="Пользовательское меню"
      >
        <Avatar 
          sx={{ 
            bgcolor: avatar.color,
            width: size,
            height: size,
            fontSize: size ? `${size / 2.5}px` : '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        >
          {avatar.initials}
        </Avatar>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: 1,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Профиль
        </MenuItem>
        
        {user.role === 'ADMIN' && (
          <>
            <Divider />
            <MenuItem onClick={handleUsersClick}>
              <ListItemIcon>
                <AdminPanelSettingsIcon fontSize="small" />
              </ListItemIcon>
              Пользователи
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Выйти
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserAvatar;
