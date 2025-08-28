"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const Add_1 = __importDefault(require("@mui/icons-material/Add"));
const SentimentDissatisfied_1 = __importDefault(require("@mui/icons-material/SentimentDissatisfied"));
const OkrEmptyState = ({ onCreateOkr }) => (<material_1.Card sx={{ p: 6, borderRadius: 4, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)', textAlign: 'center', background: '#fff' }}>
    <SentimentDissatisfied_1.default color="disabled" sx={{ fontSize: 64, mb: 2 }}/>
    <material_1.Typography color="text.secondary" fontSize={22} fontWeight={500}>OKR на выбранный период не найден.</material_1.Typography>
    <material_1.Button variant="contained" size="large" sx={{ mt: 3, borderRadius: 3, fontWeight: 700, fontSize: 18, px: 4 }} onClick={onCreateOkr} startIcon={<Add_1.default />}>
      Создать OKR
    </material_1.Button>
  </material_1.Card>);
exports.default = OkrEmptyState;
