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
exports.default = Login;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const userStore_1 = require("../store/userStore");
const react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.css");
const Login_module_css_1 = __importDefault(require("./Login.module.css"));
function Login() {
    const { register, handleSubmit, formState: { errors } } = (0, react_hook_form_1.useForm)();
    const [isLoading, setIsLoading] = react_1.default.useState(false);
    const [loginError, setLoginError] = react_1.default.useState('');
    const login = (0, userStore_1.useUserStore)((s) => s.login);
    const token = (0, userStore_1.useUserStore)((s) => s.token);
    const navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(() => {
        // Redirect if already logged in
        if (token) {
            navigate('/');
        }
    }, [token, navigate]);
    const onSubmit = (data) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        setLoginError('');
        setIsLoading(true);
        try {
            const res = yield axios_1.default.post('/auth/login', data);
            login(res.data.user, res.data.token);
            react_toastify_1.toast.success('Вход выполнен успешно!');
            navigate('/');
        }
        catch (error) {
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Неверный email или пароль';
            setLoginError(errorMessage);
            react_toastify_1.toast.error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    });
    return (<div className={Login_module_css_1.default.loginContainer}>
      <div className={Login_module_css_1.default.loginCard}>
        <div className={Login_module_css_1.default.loginContent}>
          {/* Logo */}
          <div className={Login_module_css_1.default.logoContainer}>
            <svg className={Login_module_css_1.default.coffeeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="8" r="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="16" r="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Welcome Text */}
          <div>
            <h1 className={Login_module_css_1.default.title}>Добро пожаловать</h1>
            <p className={Login_module_css_1.default.subtitle}>Войдите в свой аккаунт OKR</p>
          </div>

          {/* Form */}
          {loginError && (<div className={Login_module_css_1.default.errorAlert}>
              <svg className={Login_module_css_1.default.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {loginError}
            </div>)}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Input */}
            <div className={Login_module_css_1.default.formGroup}>
              <label htmlFor="email" className={Login_module_css_1.default.label}>
                Email
              </label>
              <div className={Login_module_css_1.default.inputContainer}>
                <svg className={Login_module_css_1.default.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input id="email" type="email" className={`${Login_module_css_1.default.input} ${errors.email ? Login_module_css_1.default.inputError : ''}`} placeholder="you@example.com" {...register('email', {
        required: 'Email обязателен',
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Неверный формат email',
        },
    })}/>
              </div>
              {errors.email && (<p className={Login_module_css_1.default.errorMessage}>{errors.email.message}</p>)}
            </div>

            {/* Password Input */}
            <div className={Login_module_css_1.default.formGroup}>
              <label htmlFor="password" className={Login_module_css_1.default.label}>
                Пароль
              </label>
              <div className={Login_module_css_1.default.inputContainer}>
                <svg className={Login_module_css_1.default.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input id="password" type="password" className={`${Login_module_css_1.default.input} ${errors.password ? Login_module_css_1.default.inputError : ''}`} placeholder="••••••••" {...register('password', {
        required: 'Пароль обязателен',
        minLength: {
            value: 6,
            message: 'Пароль должен содержать минимум 6 символов',
        },
    })}/>
              </div>
              {errors.password && (<p className={Login_module_css_1.default.errorMessage}>{errors.password.message}</p>)}
            </div>

            {/* Remember Me & Forgot */}
            <div className={Login_module_css_1.default.rememberForgot}>
              <label className={Login_module_css_1.default.rememberLabel}>
                <input type="checkbox" className={Login_module_css_1.default.checkbox} {...register('rememberMe')}/>
                Запомнить меня
              </label>
              <react_router_dom_1.Link to="/forgot-password" className={Login_module_css_1.default.forgotLink}>
                Забыли пароль?
              </react_router_dom_1.Link>
            </div>

            {/* Sign In Button */}
            <button type="submit" className={Login_module_css_1.default.submitButton} disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className={Login_module_css_1.default.signupContainer}>
            Нет аккаунта?{' '}
            <react_router_dom_1.Link to="/register" className={Login_module_css_1.default.signupLink}>
              Зарегистрироваться
            </react_router_dom_1.Link>
          </div>
        </div>
      </div>
    </div>);
}
