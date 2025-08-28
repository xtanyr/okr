"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const Logout_1 = __importDefault(require("@mui/icons-material/Logout"));
const Person_1 = __importDefault(require("@mui/icons-material/Person"));
const AdminPanelSettings_1 = __importDefault(require("@mui/icons-material/AdminPanelSettings"));
const react_router_dom_1 = require("react-router-dom");
const userStore_1 = require("../store/userStore");
const UserAvatar = ({ size = 40 }) => {
    const user = (0, userStore_1.useUserStore)(state => state.user);
    const logout = (0, userStore_1.useUserStore)(state => state.logout);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [anchorEl, setAnchorEl] = react_1.default.useState(null);
    if (!user)
        return null;
    const handleMenuOpen = (event) => {
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
    const avatar = (0, userStore_1.getUserAvatar)(user.firstName, user.lastName, user.id || user.email);
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
    return (<>
      <material_1.IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0 }} aria-label="Пользовательское меню">
        <material_1.Avatar sx={{
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
        }}>
          {avatar.initials}
        </material_1.Avatar>
      </material_1.IconButton>
      
      <material_1.Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} onClick={handleMenuClose} PaperProps={{
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
        }} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <material_1.Box sx={{ px: 2, py: 1 }}>
          <material_1.Typography variant="subtitle2" fontWeight={600}>
            {displayName}
          </material_1.Typography>
          <material_1.Typography variant="caption" color="text.secondary">
            {user.email}
          </material_1.Typography>
        </material_1.Box>
        <material_1.Divider sx={{ my: 1 }}/>
        <material_1.MenuItem onClick={handleProfileClick}>
          <material_1.ListItemIcon>
            <Person_1.default fontSize="small"/>
          </material_1.ListItemIcon>
          Профиль
        </material_1.MenuItem>
        
        {user.role === 'ADMIN' && (<>
            <material_1.Divider />
            <material_1.MenuItem onClick={handleUsersClick}>
              <material_1.ListItemIcon>
                <AdminPanelSettings_1.default fontSize="small"/>
              </material_1.ListItemIcon>
              Пользователи
            </material_1.MenuItem>
          </>)}
        <material_1.Divider />
        <material_1.MenuItem onClick={handleLogout}>
          <material_1.ListItemIcon>
            <Logout_1.default fontSize="small"/>
          </material_1.ListItemIcon>
          Выйти
        </material_1.MenuItem>
      </material_1.Menu>
    </>);
};
exports.default = UserAvatar;
