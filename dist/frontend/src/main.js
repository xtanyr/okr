"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const App_1 = __importDefault(require("./App"));
require("./index.css");
const material_1 = require("@mui/material");
const theme_1 = __importDefault(require("./theme"));
const react_query_1 = require("@tanstack/react-query");
const axios_1 = __importDefault(require("axios"));
const queryClient = new react_query_1.QueryClient();
axios_1.default.defaults.baseURL = 'http://localhost:4000';
axios_1.default.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
client_1.default.createRoot(document.getElementById('root')).render(<react_1.default.StrictMode>
    <react_query_1.QueryClientProvider client={queryClient}>
      <material_1.ThemeProvider theme={theme_1.default}>
        <material_1.CssBaseline />
    <App_1.default />
      </material_1.ThemeProvider>
    </react_query_1.QueryClientProvider>
  </react_1.default.StrictMode>);
