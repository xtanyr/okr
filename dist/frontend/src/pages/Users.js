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
const icons_material_1 = require("@mui/icons-material");
const axios_1 = __importDefault(require("axios"));
const userStore_1 = require("../store/userStore");
const react_toastify_1 = require("react-toastify");
const Users = () => {
    const [users, setUsers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = (0, react_1.useState)(false);
    const [userToDelete, setUserToDelete] = (0, react_1.useState)(null);
    const { user: currentUser } = (0, userStore_1.useUserStore)();
    const isAdmin = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'ADMIN';
    (0, react_1.useEffect)(() => {
        axios_1.default.get('/user/all')
            .then(res => setUsers(res.data))
            .catch(e => { var _a, _b; return setError(((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Ошибка загрузки'); })
            .finally(() => setLoading(false));
    }, []);
    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!userToDelete)
            return;
        try {
            yield axios_1.default.delete(`/user/${userToDelete.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(users.filter(u => u.id !== userToDelete.id));
            react_toastify_1.toast.success('Пользователь удален');
        }
        catch (error) {
            react_toastify_1.toast.error('Ошибка при удалении пользователя');
            console.error('Error deleting user:', error);
        }
        finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    });
    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };
    return (<material_1.Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <material_1.IconButton onClick={() => window.history.back()} color="primary" sx={{
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
                bgcolor: 'action.hover'
            }
        }}>
          <icons_material_1.ArrowBack />
        </material_1.IconButton>
        <material_1.Typography variant="h4" fontWeight={700}>
          Все пользователи
        </material_1.Typography>
      </material_1.Box>
      {loading ? (<material_1.Stack alignItems="center" py={8}><material_1.CircularProgress /></material_1.Stack>) : error ? (<material_1.Typography color="error" align="center">{error}</material_1.Typography>) : (<material_1.TableContainer component={material_1.Paper} sx={{ borderRadius: 3 }}>
          <material_1.Table>
            <material_1.TableHead>
              <material_1.TableRow>
                <material_1.TableCell>Аватар</material_1.TableCell>
                <material_1.TableCell>Имя</material_1.TableCell>
                <material_1.TableCell>Email</material_1.TableCell>
                <material_1.TableCell>Роль</material_1.TableCell>
                {isAdmin && <material_1.TableCell align="right">Действия</material_1.TableCell>}
              </material_1.TableRow>
            </material_1.TableHead>
            <material_1.TableBody>
              {users.map(u => {
                const avatar = (0, userStore_1.getUserAvatar)(u.firstName, u.lastName, u.id || u.email);
                return (<material_1.TableRow key={u.id}>
                    <material_1.TableCell>
                      <material_1.Avatar sx={{ bgcolor: avatar.color, width: 40, height: 40, fontSize: 18 }}>{avatar.initials}</material_1.Avatar>
                    </material_1.TableCell>
                    <material_1.TableCell>{u.firstName} {u.lastName}</material_1.TableCell>
                    <material_1.TableCell>{u.email}</material_1.TableCell>
                    <material_1.TableCell>{u.role}</material_1.TableCell>
                    {isAdmin && (<material_1.TableCell align="right">
                        {u.id !== (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) && (<material_1.Tooltip title="Удалить пользователя">
                            <material_1.IconButton onClick={() => handleDeleteClick(u)} color="error" size="small">
                              <icons_material_1.Delete />
                            </material_1.IconButton>
                          </material_1.Tooltip>)}
                      </material_1.TableCell>)}
                  </material_1.TableRow>);
            })}
            </material_1.TableBody>
          </material_1.Table>
        </material_1.TableContainer>)}

      <material_1.Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} aria-labelledby="delete-dialog-title">
        <material_1.DialogTitle id="delete-dialog-title">Подтверждение удаления</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.DialogContentText>
            Вы уверены, что хотите удалить пользователя {userToDelete === null || userToDelete === void 0 ? void 0 : userToDelete.firstName} {userToDelete === null || userToDelete === void 0 ? void 0 : userToDelete.lastName} ({userToDelete === null || userToDelete === void 0 ? void 0 : userToDelete.email})?
            Это действие нельзя будет отменить.
          </material_1.DialogContentText>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={handleDeleteCancel} color="primary">
            Отмена
          </material_1.Button>
          <material_1.Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
};
exports.default = Users;
