"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const Dashboard_1 = __importDefault(require("@mui/icons-material/Dashboard"));
const Assignment_1 = __importDefault(require("@mui/icons-material/Assignment"));
const People_1 = __importDefault(require("@mui/icons-material/People"));
const Logout_1 = __importDefault(require("@mui/icons-material/Logout"));
const Menu_1 = __importDefault(require("@mui/icons-material/Menu"));
const userStore_1 = require("../store/userStore");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const menuItems = [
    { text: 'OKR', icon: <Dashboard_1.default />, path: '/' },
    { text: 'Пользователи', icon: <People_1.default />, path: '/users', adminOnly: true },
    { text: 'Профиль', icon: <Assignment_1.default />, path: '/profile' },
];
const Sidebar = () => {
    const user = (0, userStore_1.useUserStore)(state => state.user);
    const logout = (0, userStore_1.useUserStore)(state => state.logout);
    // Initialize state from localStorage or default to false
    const [collapsed, setCollapsed] = (0, react_1.useState)(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarCollapsed');
            return saved === 'true';
        }
        return false;
    });
    // Save to localStorage whenever collapsed state changes
    (0, react_1.useEffect)(() => {
        localStorage.setItem('sidebarCollapsed', String(collapsed));
    }, [collapsed]);
    const [mobileOpen, setMobileOpen] = (0, react_1.useState)(false);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const location = (0, react_router_dom_1.useLocation)();
    if (!user)
        return null;
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const drawerContent = (<material_1.Box sx={{
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
      <material_1.Box sx={{ flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden' }}>
        <material_1.Box sx={{
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
          <material_1.IconButton size="small" onClick={() => setCollapsed(v => !v)} sx={{
            position: 'absolute',
            right: collapsed ? '50%' : 16,
            transform: collapsed ? 'translateX(50%)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)'
            }
        }}>
            <Menu_1.default sx={{
            transform: collapsed ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s',
            color: 'text.secondary'
        }}/>
          </material_1.IconButton>
        </material_1.Box>
        {/* Имя и аватарка пользователя убраны по требованию */}
        <material_1.List sx={{
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
            // Skip admin-only items if user is not admin
            if (item.adminOnly && (user === null || user === void 0 ? void 0 : user.role) !== 'ADMIN')
                return null;
            const selected = location.pathname === item.path;
            return (<material_1.ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <material_1.ListItemButton component={react_router_dom_1.Link} to={item.path} selected={selected} sx={{
                    borderRadius: 10,
                    px: collapsed ? 1.5 : 2.5,
                    py: 1.2,
                    minHeight: 44,
                    color: selected ? '#fff' : '#111',
                    bgcolor: selected ? '#000' : 'transparent',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: selected ? '#000' : '#f2f2f2', color: selected ? '#fff' : '#111' },
                    transition: 'all 0.2s',
                }}>
                  <material_1.ListItemIcon sx={{ color: selected ? '#fff' : '#111', minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center', transition: 'color 0.2s' }}>{item.icon}</material_1.ListItemIcon>
                  {!collapsed && <material_1.ListItemText primary={item.text} primaryTypographyProps={{ sx: { color: selected ? '#fff' : '#111', fontWeight: 600, transition: 'color 0.2s' } }} sx={{ opacity: 1 }}/>}
                </material_1.ListItemButton>
              </material_1.ListItem>);
        })}
          {/* Кнопка выхода */}
          <material_1.ListItem disablePadding sx={{ mb: 1 }}>
            <material_1.ListItemButton onClick={handleLogout} sx={{
            borderRadius: 10,
            px: collapsed ? 1.5 : 2.5,
            py: 1.2,
            minHeight: 44,
            color: '#111',
            bgcolor: 'transparent',
            '&:hover': { bgcolor: '#f2f2f2', color: '#111' },
            transition: 'all 0.2s',
        }}>
              <material_1.ListItemIcon sx={{ color: '#111', minWidth: 0, mr: collapsed ? 0 : 2, justifyContent: 'center' }}><Logout_1.default fontSize="small"/></material_1.ListItemIcon>
              {!collapsed && <material_1.ListItemText primary="Выйти" sx={{ color: '#111', opacity: 1, transition: 'opacity 0.2s, color 0.2s' }}/>}
            </material_1.ListItemButton>
          </material_1.ListItem>
        </material_1.List>
      </material_1.Box>
    </material_1.Box>);
    return (<>
      {/* Мобильное меню */}
      <material_1.Box display={{ xs: 'block', md: 'none' }}>
        <material_1.IconButton onClick={() => setMobileOpen(true)} sx={{ m: 1 }}>
          <Menu_1.default />
        </material_1.IconButton>
        <material_1.Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: 240, borderRadius: 0 } }}>
          {drawerContent}
        </material_1.Drawer>
      </material_1.Box>
      {/* Десктоп меню */}
      <material_1.Box sx={{
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
        }}>
        {drawerContent}
      </material_1.Box>
    </>);
};
exports.default = Sidebar;
