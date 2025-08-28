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
exports.default = Register;
const react_1 = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const userStore_1 = require("../store/userStore");
const react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.css");
const Register_module_css_1 = __importDefault(require("./Register.module.css"));
function Register() {
    const { register, handleSubmit, formState: { errors }, watch } = (0, react_hook_form_1.useForm)();
    const [isLoading, setIsLoading] = react_1.default.useState(false);
    const { user, login } = (0, userStore_1.useUserStore)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const password = watch('password', '');
    // Redirect if already logged in
    (0, react_1.useEffect)(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);
    const onSubmit = (data) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (data.password !== data.passwordConfirm) {
            react_toastify_1.toast.error('Пароли не совпадают');
            return;
        }
        setIsLoading(true);
        try {
            const response = yield axios_1.default.post('/auth/register', data);
            login(response.data.user, response.data.token);
            react_toastify_1.toast.success('Регистрация прошла успешно!');
            navigate('/');
        }
        catch (error) {
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Произошла ошибка при регистрации';
            react_toastify_1.toast.error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    });
    return (<div className={Register_module_css_1.default.registerContainer}>
      <div className={Register_module_css_1.default.registerCard}>
        <div className={Register_module_css_1.default.registerContent}>
          {/* Logo */}
          <div className={Register_module_css_1.default.logoContainer}>
            <svg className={Register_module_css_1.default.coffeeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="8" r="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="16" r="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Welcome Text */}
          <div>
            <h1 className={Register_module_css_1.default.title}>Создать аккаунт</h1>
            <p className={Register_module_css_1.default.subtitle}>Заполните форму для регистрации</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Input */}
            <div className={Register_module_css_1.default.formGroup}>
              <label htmlFor="email" className={Register_module_css_1.default.label}>
                Email
              </label>
              <div className={Register_module_css_1.default.inputContainer}>
                <svg className={Register_module_css_1.default.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input id="email" type="email" className={`${Register_module_css_1.default.input} ${errors.email ? Register_module_css_1.default.inputError : ''}`} placeholder="you@example.com" {...register('email', {
        required: 'Email обязателен',
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Неверный формат email',
        },
    })}/>
              </div>
              {errors.email && (<p className={Register_module_css_1.default.errorMessage}>{errors.email.message}</p>)}
            </div>

            {/* First Name Input */}
            <div className={Register_module_css_1.default.formGroup}>
              <label htmlFor="firstName" className={Register_module_css_1.default.label}>
                Имя
              </label>
              <div className={Register_module_css_1.default.inputContainer}>
                <svg className={Register_module_css_1.default.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input id="firstName" type="text" className={`${Register_module_css_1.default.input} ${errors.firstName ? Register_module_css_1.default.inputError : ''}`} placeholder="Ваше имя" {...register('firstName', {
        required: 'Имя обязательно',
    })}/>
              </div>
              {errors.firstName && (<p className={Register_module_css_1.default.errorMessage}>{errors.firstName.message}</p>)}
            </div>

            {/* Last Name Input */}
            <div className={Register_module_css_1.default.formGroup}>
              <label htmlFor="lastName" className={Register_module_css_1.default.label}>
                Фамилия
              </label>
              <div className={Register_module_css_1.default.inputContainer}>
                <svg className={Register_module_css_1.default.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input id="lastName" type="text" className={`${Register_module_css_1.default.input} ${errors.lastName ? Register_module_css_1.default.inputError : ''}`} placeholder="Ваша фамилия" {...register('lastName', {
        required: 'Фамилия обязательна',
    })}/>
              </div>
              {errors.lastName && (<p className={Register_module_css_1.default.errorMessage}>{errors.lastName.message}</p>)}
            </div>

            {/* Password Input */}
            <div className={Register_module_css_1.default.formGroup}>
              <label htmlFor="password" className={Register_module_css_1.default.label}>
                Пароль
              </label>
              <div className={Register_module_css_1.default.inputContainer}>
                <svg className={Register_module_css_1.default.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input id="password" type="password" className={`${Register_module_css_1.default.input} ${errors.password ? Register_module_css_1.default.inputError : ''}`} placeholder="••••••••" {...register('password', {
        required: 'Пароль обязателен',
        minLength: {
            value: 6,
            message: 'Пароль должен содержать минимум 6 символов',
        },
    })}/>
              </div>
              {errors.password && (<p className={Register_module_css_1.default.errorMessage}>{errors.password.message}</p>)}
            </div>

            {/* Confirm Password Input */}
            <div className={Register_module_css_1.default.formGroup}>
              <label htmlFor="passwordConfirm" className={Register_module_css_1.default.label}>
                Подтверждение пароля
              </label>
              <div className={Register_module_css_1.default.inputContainer}>
                <svg className={Register_module_css_1.default.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input id="passwordConfirm" type="password" className={`${Register_module_css_1.default.input} ${errors.passwordConfirm ? Register_module_css_1.default.inputError : ''}`} placeholder="••••••••" {...register('passwordConfirm', {
        required: 'Подтверждение пароля обязательно',
        validate: value => value === password || 'Пароли не совпадают',
    })}/>
              </div>
              {errors.passwordConfirm && (<p className={Register_module_css_1.default.errorMessage}>{errors.passwordConfirm.message}</p>)}
            </div>

            {/* Code Word Input */}
            <div className={Register_module_css_1.default.formGroup}>
              <label htmlFor="codeWord" className={Register_module_css_1.default.label}>
                Кодовое слово
              </label>
              <div className={Register_module_css_1.default.inputContainer}>
                <svg className={Register_module_css_1.default.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input id="codeWord" type="password" className={`${Register_module_css_1.default.input} ${errors.codeWord ? Register_module_css_1.default.inputError : ''}`} placeholder="Введите кодовое слово" {...register('codeWord', {
        required: 'Кодовое слово обязательно для регистрации',
    })}/>
              </div>
              {errors.codeWord && (<p className={Register_module_css_1.default.errorMessage}>{errors.codeWord.message}</p>)}
            </div>

            {/* Submit Button */}
            <button type="submit" className={Register_module_css_1.default.submitButton} disabled={isLoading}>
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          {/* Login Link */}
          <div className={Register_module_css_1.default.signupContainer}>
            Уже есть аккаунт?{' '}
            <react_router_dom_1.Link to="/login" className={Register_module_css_1.default.signupLink}>
              Войти
            </react_router_dom_1.Link>
          </div>
        </div>
      </div>
    </div>);
}
