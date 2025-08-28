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
const Dashboard_module_css_1 = __importDefault(require("../pages/Dashboard.module.css"));
const GoalActions = ({ goal, onEdit, onDelete, onDuplicate, onToggleArchive, onMarkAsCompleted, onShare, onRefresh, size = 'medium', color = 'inherit', showText = false, disabled = false, }) => {
    const theme = (0, material_1.useTheme)();
    const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down('sm'));
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = (0, react_1.useState)(false);
    const [isDeleting, setIsDeleting] = (0, react_1.useState)(false);
    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleEdit = () => {
        handleMenuClose();
        onEdit();
    };
    const handleDeleteClick = () => {
        handleMenuClose();
        setDeleteConfirmOpen(true);
    };
    const handleConfirmDelete = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setIsDeleting(true);
            yield onDelete(goal.id);
            setDeleteConfirmOpen(false);
        }
        catch (error) {
            console.error('Error deleting goal:', error);
        }
        finally {
            setIsDeleting(false);
        }
    });
    const handleDuplicate = () => {
        handleMenuClose();
        onDuplicate(goal);
    };
    const handleToggleArchive = () => __awaiter(void 0, void 0, void 0, function* () {
        handleMenuClose();
        yield onToggleArchive(goal);
    });
    const handleMarkAsCompleted = () => {
        handleMenuClose();
        if (onMarkAsCompleted)
            onMarkAsCompleted(goal);
    };
    const handleShare = () => {
        handleMenuClose();
        if (onShare)
            onShare(goal);
    };
    const handleRefresh = () => {
        handleMenuClose();
        if (onRefresh)
            onRefresh(goal);
    };
    const actionItems = [
        {
            id: 'edit',
            icon: <icons_material_1.Edit fontSize="small"/>,
            text: 'Редактировать',
            action: handleEdit,
            show: true,
        },
        {
            id: 'duplicate',
            icon: <icons_material_1.FileCopy fontSize="small"/>,
            text: 'Дублировать',
            action: handleDuplicate,
            show: true,
        },
        {
            id: 'archive',
            icon: goal.isArchived ? <icons_material_1.Unarchive fontSize="small"/> : <icons_material_1.Archive fontSize="small"/>,
            text: goal.isArchived ? 'Разархивировать' : 'Архивировать',
            action: handleToggleArchive,
            show: true,
        },
        {
            id: 'completed',
            icon: <icons_material_1.Flag fontSize="small"/>,
            text: 'Отметить как выполненную',
            action: handleMarkAsCompleted,
            show: !!onMarkAsCompleted && goal.status !== 'completed',
        },
        {
            id: 'share',
            icon: <icons_material_1.Share fontSize="small"/>,
            text: 'Поделиться',
            action: handleShare,
            show: !!onShare,
        },
        {
            id: 'refresh',
            icon: <icons_material_1.Refresh fontSize="small"/>,
            text: 'Обновить',
            action: handleRefresh,
            show: !!onRefresh,
        },
        {
            id: 'divider',
            divider: true,
            show: true,
        },
        {
            id: 'delete',
            icon: <icons_material_1.Delete fontSize="small" color="error"/>,
            text: 'Удалить',
            action: handleDeleteClick,
            show: true,
            textColor: theme.palette.error.main,
        },
    ].filter(item => item.show);
    // For mobile, show a more compact view with just the menu
    if (isMobile && !showText) {
        return (<material_1.Box>
        <material_1.Tooltip title="Действия">
          <material_1.IconButton size={size} color={color} onClick={handleMenuOpen} disabled={disabled} className={Dashboard_module_css_1.default.goalActionButton}>
            <icons_material_1.MoreVert />
          </material_1.IconButton>
        </material_1.Tooltip>

        <material_1.Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} onClick={(e) => e.stopPropagation()} anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }} transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }} className={Dashboard_module_css_1.default.goalActionsMenu}>
          {actionItems.map((item) => item.id === 'divider' ? (<material_1.Divider key={item.id}/>) : (<material_1.MenuItem key={item.id} onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                }} className={Dashboard_module_css_1.default.goalActionsMenuItem} sx={{
                    color: item.id === 'delete' ? theme.palette.error.main : 'inherit',
                }}>
                <material_1.ListItemIcon sx={{
                    color: item.id === 'delete' ? theme.palette.error.main : 'inherit',
                    minWidth: 36,
                }}>
                  {item.icon}
                </material_1.ListItemIcon>
                <material_1.ListItemText primary={item.text}/>
              </material_1.MenuItem>))}
        </material_1.Menu>

        <material_1.Dialog open={deleteConfirmOpen} onClose={() => !isDeleting && setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
          <material_1.DialogTitle>Подтверждение удаления</material_1.DialogTitle>
          <material_1.DialogContent>
            <material_1.DialogContentText>
              Вы уверены, что хотите удалить цель "{goal.title}"? Это действие нельзя отменить.
            </material_1.DialogContentText>
          </material_1.DialogContent>
          <material_1.DialogActions>
            <material_1.Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting} color="inherit">
              Отмена
            </material_1.Button>
            <material_1.Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting} startIcon={<icons_material_1.Delete />}>
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </material_1.Button>
          </material_1.DialogActions>
        </material_1.Dialog>
      </material_1.Box>);
    }
    // For desktop, show individual buttons with text
    return (<material_1.Box display="flex" gap={1} flexWrap="wrap">
      {actionItems
            .filter((item) => !['divider', 'delete'].includes(item.id))
            .map((item) => (<material_1.Tooltip key={item.id} title={item.text}>
            <material_1.Button size={size} color={color} onClick={(e) => {
                e.stopPropagation();
                item.action();
            }} startIcon={item.icon} disabled={disabled} className={Dashboard_module_css_1.default.goalActionButton} sx={{
                color: item.textColor,
                '&:hover': {
                    backgroundColor: item.id === 'delete'
                        ? theme.palette.error.background
                        : theme.palette.action.hover,
                },
            }}>
              {showText && item.text}
            </material_1.Button>
          </material_1.Tooltip>))}

      {/* Delete button with confirmation dialog */}
      <material_1.Dialog open={deleteConfirmOpen} onClose={() => !isDeleting && setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <material_1.DialogTitle>Подтверждение удаления</material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.DialogContentText>
            Вы уверены, что хотите удалить цель "{goal.title}"? Это действие нельзя отменить.
          </material_1.DialogContentText>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting} color="inherit">
            Отмена
          </material_1.Button>
          <material_1.Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting} startIcon={<icons_material_1.Delete />}>
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
};
exports.default = GoalActions;
