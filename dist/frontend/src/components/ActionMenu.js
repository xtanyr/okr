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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const MoreVert_1 = __importDefault(require("@mui/icons-material/MoreVert"));
const Delete_1 = __importDefault(require("@mui/icons-material/Delete"));
const FileCopy_1 = __importDefault(require("@mui/icons-material/FileCopy"));
const Add_1 = __importDefault(require("@mui/icons-material/Add"));
const ActionMenu = ({ onAdd, onDelete, onDuplicate, itemType, disabled = false }) => {
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (event) => {
        event.stopPropagation();
        setAnchorEl(null);
    };
    const handleAction = (action, event) => {
        event.stopPropagation();
        action();
        setAnchorEl(null);
    };
    return (<>
      <material_1.Tooltip title="Действия">
        <material_1.IconButton size="small" onClick={handleClick} disabled={disabled} sx={{
            opacity: 0.7,
            '&:hover': {
                opacity: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
        }}>
          <MoreVert_1.default fontSize="small"/>
        </material_1.IconButton>
      </material_1.Tooltip>
      <material_1.Menu anchorEl={anchorEl} open={open} onClose={handleClose} onClick={(e) => e.stopPropagation()} anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }} transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}>
        {onAdd && (<material_1.MenuItem onClick={(e) => handleAction(onAdd, e)}>
            <material_1.ListItemIcon>
              <Add_1.default fontSize="small"/>
            </material_1.ListItemIcon>
            <material_1.ListItemText>Добавить ключевой результат</material_1.ListItemText>
          </material_1.MenuItem>)}
        {onDuplicate && (<material_1.MenuItem onClick={(e) => handleAction(onDuplicate, e)}>
            <material_1.ListItemIcon>
              <FileCopy_1.default fontSize="small"/>
            </material_1.ListItemIcon>
            <material_1.ListItemText>Дублировать {itemType === 'goal' ? 'цель' : 'ключевой результат'}</material_1.ListItemText>
          </material_1.MenuItem>)}
        {onDelete && (<material_1.MenuItem onClick={(e) => handleAction(onDelete, e)}>
            <material_1.ListItemIcon>
              <Delete_1.default fontSize="small" color="error"/>
            </material_1.ListItemIcon>
            <material_1.ListItemText primaryTypographyProps={{ color: 'error' }}>
              Удалить {itemType === 'goal' ? 'цель' : 'ключевой результат'}
            </material_1.ListItemText>
          </material_1.MenuItem>)}
      </material_1.Menu>
    </>);
};
exports.default = ActionMenu;
