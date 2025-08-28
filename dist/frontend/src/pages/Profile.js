"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const ArrowBack_1 = __importDefault(require("@mui/icons-material/ArrowBack"));
const userStore_1 = require("../store/userStore");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const StarBackground_1 = __importDefault(require("../components/StarBackground"));
const Profile = () => {
    const user = (0, userStore_1.useUserStore)((s) => s.user);
    const setUser = (0, userStore_1.useUserStore)((s) => s.setUser);
    const navigate = (0, react_router_dom_1.useNavigate)();
    // Состояния для формы имени
    const [firstName, setFirstName] = (0, react_1.useState)((user === null || user === void 0 ? void 0 : user.firstName) || '');
    const [lastName, setLastName] = (0, react_1.useState)((user === null || user === void 0 ? void 0 : user.lastName) || '');
    const [nameLoading, setNameLoading] = (0, react_1.useState)(false);
    const [nameError, setNameError] = (0, react_1.useState)(null);
    const [nameSuccess, setNameSuccess] = (0, react_1.useState)(false);
    // Состояния для формы пароля
    const [oldPassword, setOldPassword] = (0, react_1.useState)('');
    const [newPassword, setNewPassword] = (0, react_1.useState)('');
    const [newPasswordConfirm, setNewPasswordConfirm] = (0, react_1.useState)('');
    const [passLoading, setPassLoading] = (0, react_1.useState)(false);
    const [passError, setPassError] = (0, react_1.useState)(null);
    const [passSuccess, setPassSuccess] = (0, react_1.useState)(false);
    if (!user)
        return null;
    const avatar = (0, userStore_1.getUserAvatar)(user.firstName, user.lastName, user.id || user.email);
    const handleBack = () => {
        navigate('/dashboard');
    };
    const handleNameSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        e.preventDefault();
        setNameLoading(true);
        setNameError(null);
        setNameSuccess(false);
        try {
            const res = yield axios_1.default.patch('/user/me', { firstName, lastName });
            setUser(Object.assign(Object.assign({}, user), { firstName: res.data.firstName, lastName: res.data.lastName }));
            setNameSuccess(true);
        }
        catch (e) {
            setNameError(((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Ошибка обновления профиля');
        }
        finally {
            setNameLoading(false);
        }
    });
    const handlePasswordSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        e.preventDefault();
        setPassLoading(true);
        setPassError(null);
        setPassSuccess(false);
        try {
            yield axios_1.default.post('/user/change-password', { oldPassword, newPassword, newPasswordConfirm });
            setPassSuccess(true);
            setOldPassword('');
            setNewPassword('');
            setNewPasswordConfirm('');
        }
        catch (e) {
            setPassError(((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Ошибка смены пароля');
        }
        finally {
            setPassLoading(false);
        }
    });
    // Add global styles to remove default margins and padding
    react_1.default.useEffect(() => {
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
    return (<material_1.Box className="profile-root" sx={{
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
      <material_1.Box maxWidth={800} mx="auto" p={3} width="100%" sx={{ flex: 1 }}>
        <material_1.Box maxWidth={600} mx="auto" width="100%">
        <material_1.Box display="flex" alignItems="center" mb={4}>
          <material_1.IconButton onClick={handleBack} sx={{ mr: 2 }} aria-label="Вернуться">
            <ArrowBack_1.default />
          </material_1.IconButton>
          <material_1.Typography variant="h5" component="h1">
            OKR
          </material_1.Typography>
        </material_1.Box>
        <material_1.Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%' }}>
          <material_1.Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <material_1.Avatar sx={{
            width: 100,
            height: 100,
            fontSize: '2.5rem',
            bgcolor: avatar.color,
            mb: 2,
        }}>
              {avatar.initials}
            </material_1.Avatar>
            <material_1.Typography variant="h6" component="h2" align="center">
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
            </material_1.Typography>
            <material_1.Typography variant="body2" color="text.secondary" align="center">
              {user.email}
            </material_1.Typography>
          </material_1.Box>
          <material_1.Divider sx={{ my: 4 }}/>
          <material_1.Typography variant="h6" fontWeight={600} mb={2}>
            Редактировать профиль
          </material_1.Typography>
          <form onSubmit={handleNameSubmit}>
            <material_1.Stack spacing={2}>
              <material_1.TextField label="Имя" value={firstName} onChange={e => setFirstName(e.target.value)} required fullWidth disabled={nameLoading}/>
              <material_1.TextField label="Фамилия" value={lastName} onChange={e => setLastName(e.target.value)} required fullWidth disabled={nameLoading}/>
              {nameError && <material_1.Alert severity="error">{nameError}</material_1.Alert>}
              {nameSuccess && <material_1.Alert severity="success">Профиль обновлён</material_1.Alert>}
              <material_1.Button type="submit" variant="contained" disabled={nameLoading || (!firstName.trim() || !lastName.trim())} sx={{ fontWeight: 600 }}>
                {nameLoading ? 'Сохранение...' : 'Сохранить'}
              </material_1.Button>
            </material_1.Stack>
          </form>
          <material_1.Divider sx={{ my: 4 }}/>
          <material_1.Typography variant="h6" fontWeight={600} mb={2}>
            Сменить пароль
          </material_1.Typography>
          <form onSubmit={handlePasswordSubmit}>
            <material_1.Stack spacing={2}>
              <material_1.TextField label="Старый пароль" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required fullWidth disabled={passLoading}/>
              <material_1.TextField label="Новый пароль" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required fullWidth disabled={passLoading}/>
              <material_1.TextField label="Повторите новый пароль" type="password" value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)} required fullWidth disabled={passLoading}/>
              {passError && <material_1.Alert severity="error">{passError}</material_1.Alert>}
              {passSuccess && <material_1.Alert severity="success">Пароль успешно изменён</material_1.Alert>}
              <material_1.Button type="submit" variant="contained" color="primary" disabled={passLoading || !oldPassword || !newPassword || !newPasswordConfirm} sx={{ fontWeight: 600 }}>
                {passLoading ? 'Смена...' : 'Сменить пароль'}
              </material_1.Button>
            </material_1.Stack>
          </form>
        </material_1.Paper>
        </material_1.Box>
      </material_1.Box>
      
      {/* Full-width footer with snowflakes */}
      <material_1.Box component="footer" sx={{
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
        }}>
        <material_1.Box sx={{
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
        }}>
          <material_1.Box position="absolute" top={0} left={0} right={0} bottom={0} overflow="hidden" zIndex={1}>
            <StarBackground_1.default />
          </material_1.Box>
          <material_1.Box position="relative" zIndex={1}>
            <material_1.Typography variant="h6" sx={{
            color: 'rgba(0, 0, 0, 0.9)',
            fontWeight: 700,
            letterSpacing: '1px',
            mb: 1,
            fontSize: '1.25rem',
            textAlign: 'center',
            textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)'
        }}>
              xtany dev
            </material_1.Typography>
          </material_1.Box>
          <material_1.Typography variant="caption" sx={{
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
        }}>
          {new Date().getFullYear()} skuratov team
          </material_1.Typography>
        </material_1.Box>
      </material_1.Box>
    </material_1.Box>);
};
exports.default = Profile;
