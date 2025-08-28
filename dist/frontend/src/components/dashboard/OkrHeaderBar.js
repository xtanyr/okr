"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const OkrHeaderBar = ({ period, archived }) => {
    return (<material_1.Box display="flex" justifyContent="space-between" alignItems="center">
      <material_1.Box display="flex" alignItems="center" gap={2}>
        <material_1.Typography variant="h5" component="h2">
          OKR: {period}
        </material_1.Typography>
        {archived && (<material_1.Chip label="Архивный" color="default" size="small" variant="outlined" sx={{
                borderColor: 'text.secondary',
                color: 'text.secondary',
                fontSize: '0.75rem',
                height: '24px'
            }}/>)}
      </material_1.Box>
    </material_1.Box>);
};
exports.default = OkrHeaderBar;
