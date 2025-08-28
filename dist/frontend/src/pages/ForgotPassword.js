"use strict";
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
exports.default = ForgotPassword;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.css");
const Login_module_css_1 = __importDefault(require("./Login.module.css"));
function ForgotPassword() {
    const { register, handleSubmit, formState: { errors } } = (0, react_hook_form_1.useForm)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [emailSent, setEmailSent] = (0, react_1.useState)(false);
    const onSubmit = (data) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        setIsLoading(true);
        try {
            yield axios_1.default.post('/auth/forgot-password', { email: data.email });
            setEmailSent(true);
            react_toastify_1.toast.success('Если аккаунт с таким email существует, на него было отправлено письмо с инструкциями.');
        }
        catch (error) {
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Произошла ошибка. Пожалуйста, попробуйте снова.';
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

          <div>
            <h1 className={Login_module_css_1.default.title}>Восстановление пароля</h1>
            <p className={Login_module_css_1.default.subtitle}>Введите email, указанный при регистрации</p>
          </div>

          {!emailSent ? (<form onSubmit={handleSubmit(onSubmit)}>
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

              <button type="submit" className={Login_module_css_1.default.submitButton} disabled={isLoading}>
                {isLoading ? 'Отправка...' : 'Отправить ссылку для сброса'}
              </button>
            </form>) : (<div className={Login_module_css_1.default.successMessage}>
              <p>Письмо с инструкциями по сбросу пароля было отправлено на ваш email.</p>
              <p>Пожалуйста, проверьте вашу почту и следуйте инструкциям в письме.</p>
            </div>)}

          <div className={Login_module_css_1.default.signupContainer}>
            <react_router_dom_1.Link to="/login" className={Login_module_css_1.default.signupLink}>
              Вернуться на страницу входа
            </react_router_dom_1.Link>
          </div>
        </div>
      </div>
    </div>);
}
