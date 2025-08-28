"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Layout;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const react_router_dom_1 = require("react-router-dom");
function Layout({ children }) {
    return (<material_1.Box sx={{ minHeight: '100vh', background: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <material_1.CssBaseline />
      <material_1.Box component="main" sx={{
            width: '100%',
            p: { xs: 1, sm: 2, md: 3 },
            maxWidth: '100vw',
            overflow: 'hidden',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        }}>
        {children || <react_router_dom_1.Outlet />}
      </material_1.Box>
      
    </material_1.Box>);
}
