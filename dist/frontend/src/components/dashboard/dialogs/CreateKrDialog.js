"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const CreateKrDialog = ({ open, value, onChange, onClose, onSubmit }) => {
    return (<material_1.Dialog open={open} onClose={onClose}>
      <material_1.DialogTitle>Создать ключевой результат</material_1.DialogTitle>
      <material_1.DialogContent>
        <material_1.TextField label="Название ключевого результата" value={value} onChange={(e) => onChange(e.target.value)} fullWidth autoFocus sx={{ mt: 2 }}/>
      </material_1.DialogContent>
      <material_1.DialogActions>
        <material_1.Button onClick={onClose}>Отмена</material_1.Button>
        <material_1.Button variant="contained" onClick={onSubmit} disabled={!value.trim()}>Создать</material_1.Button>
      </material_1.DialogActions>
    </material_1.Dialog>);
};
exports.default = CreateKrDialog;
