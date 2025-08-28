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
exports.default = ResetPassword;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.css");
const Login_module_css_1 = __importDefault(require("./Login.module.css"));
function ResetPassword() {
    const [searchParams] = (0, react_router_dom_1.useSearchParams)();
    const token = searchParams.get('token');
    const [isValidToken, setIsValidToken] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { register, handleSubmit, watch, formState: { errors } } = (0, react_hook_form_1.useForm)();
    const password = watch('password');
    (0, react_1.useEffect)(() => {
        setIsValidToken(!!token);
        setIsLoading(false);
    }, [token]);
    const onSubmit = (data) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!token)
            return;
        setIsSubmitting(true);
        try {
            yield axios_1.default.post('/auth/reset-password', {
                token,
                password: data.password,
                passwordConfirm: data.passwordConfirm,
            });
            react_toastify_1.toast.success('Пароль успешно изменен!');
            navigate('/login');
        }
        catch (error) {
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Произошла ошибка. Пожалуйста, попробуйте снова.';
            react_toastify_1.toast.error(errorMessage);
        }
        finally {
            setIsSubmitting(false);
        }
    });
    if (isLoading) {
        return <div className={Login_module_css_1.default.loginContainer}><div className={Login_module_css_1.default.loginCard}><div className={Login_module_css_1.default.loginContent}>Проверка...</div></div></div>;
    }
    if (!isValidToken) {
        return (<div className={Login_module_css_1.default.loginContainer}>
        <div className={Login_module_css_1.default.loginCard}>
          <div className={Login_module_css_1.default.loginContent}>
            <h1 className={Login_module_css_1.default.title}>Неверная ссылка</h1>
            <p>Ссылка недействительна или устарела.</p>
            <div className={Login_module_css_1.default.signupContainer}>
              <react_router_dom_1.Link to="/forgot-password" className={Login_module_css_1.default.signupLink}>
                Запросить новую ссылку
              </react_router_dom_1.Link>
            </div>
          </div>
        </div>
      </div>);
    }
    return (<div className={Login_module_css_1.default.loginContainer}>
      <div className={Login_module_css_1.default.loginCard}>
        <div className={Login_module_css_1.default.loginContent}>
          <h1 className={Login_module_css_1.default.title}>Новый пароль</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={Login_module_css_1.default.formGroup}>
              <label>Новый пароль</label>
              <input type="password" className={`${Login_module_css_1.default.input} ${errors.password ? Login_module_css_1.default.inputError : ''}`} placeholder="••••••••" {...register('password', {
        required: 'Пароль обязателен',
        minLength: { value: 6, message: 'Минимум 6 символов' },
    })}/>
              {errors.password && <p className={Login_module_css_1.default.errorMessage}>{errors.password.message}</p>}
            </div>

            <div className={Login_module_css_1.default.formGroup}>
              <label>Подтвердите пароль</label>
              <input type="password" className={`${Login_module_css_1.default.input} ${errors.passwordConfirm ? Login_module_css_1.default.inputError : ''}`} placeholder="••••••••" {...register('passwordConfirm', {
        required: 'Подтвердите пароль',
        validate: value => value === password || 'Пароли не совпадают'
    })}/>
              {errors.passwordConfirm && <p className={Login_module_css_1.default.errorMessage}>{errors.passwordConfirm.message}</p>}
            </div>

            <button type="submit" className={Login_module_css_1.default.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить пароль'}
            </button>
          </form>
          
          <div className={Login_module_css_1.default.signupContainer}>
            <react_router_dom_1.Link to="/login" className={Login_module_css_1.default.signupLink}>
              Вернуться на страницу входа
            </react_router_dom_1.Link>
          </div>
        </div>
      </div>
    </div>);
}
