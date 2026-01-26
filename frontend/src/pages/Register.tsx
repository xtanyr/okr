import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Register.module.css';

interface RegisterForm {
  email: string;
  password: string;
  passwordConfirm: string;
  lastName: string;
  firstName: string;
  codeWord: string;
}

export default function Register() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { user, login } = useUserStore();
  const navigate = useNavigate();
  const password = watch('password', '');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (data: RegisterForm) => {
    setFormError(null);
    
    if (data.password !== data.passwordConfirm) {
      setFormError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/auth/register', {
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        firstName: data.firstName,
        lastName: data.lastName,
        codeWord: data.codeWord
      });
      
      login(response.data.user, response.data.token);
      toast.success('Регистрация прошла успешно!');
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Произошла ошибка при регистрации';
      
      if (error.response) {
        const responseData = error.response.data || {};
        
        console.log('Error response data:', responseData);
        
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (error.response.statusText) {
          errorMessage = error.response.statusText;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'Нет ответа от сервера. Проверьте подключение к интернету.';
      } else {
        console.error('Request setup error:', error.message);
        errorMessage = error.message || 'Ошибка при настройке запроса';
      }
      
      setFormError(errorMessage || 'Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerContent}>
          {/* Logo */}
          <div className={styles.logoContainer}>
            <svg 
              className={styles.coffeeIcon}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="8" r="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="16" r="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Welcome Text */}
          <div>
            <h1 className={styles.title}>Создать аккаунт</h1>
            <p className={styles.subtitle}>Заполните форму для регистрации</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Input */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <div className={styles.inputContainer}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email обязателен',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Неверный формат email',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className={styles.errorMessage}>{errors.email.message}</p>
              )}
            </div>

            {/* First Name Input */}
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>
                Имя
              </label>
              <div className={styles.inputContainer}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  id="firstName"
                  type="text"
                  className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                  placeholder="Ваше имя"
                  {...register('firstName', {
                    required: 'Имя обязательно',
                  })}
                />
              </div>
              {errors.firstName && (
                <p className={styles.errorMessage}>{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name Input */}
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Фамилия
              </label>
              <div className={styles.inputContainer}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  id="lastName"
                  type="text"
                  className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                  placeholder="Ваша фамилия"
                  {...register('lastName', {
                    required: 'Фамилия обязательна',
                  })}
                />
              </div>
              {errors.lastName && (
                <p className={styles.errorMessage}>{errors.lastName.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Пароль
              </label>
              <div className={styles.inputContainer}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Пароль обязателен',
                    minLength: {
                      value: 6,
                      message: 'Пароль должен содержать минимум 6 символов',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className={styles.errorMessage}>{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className={styles.formGroup}>
              <label htmlFor="passwordConfirm" className={styles.label}>
                Подтверждение пароля
              </label>
              <div className={styles.inputContainer}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  id="passwordConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`${styles.input} ${errors.passwordConfirm ? styles.inputError : ''}`}
                  placeholder="••••••••"
                  {...register('passwordConfirm', {
                    required: 'Подтверждение пароля обязательно',
                    validate: value => value === password || 'Пароли не совпадают',
                  })}
                />
              </div>
              {errors.passwordConfirm && (
                <p className={styles.errorMessage}>{errors.passwordConfirm.message}</p>
              )}
            </div>

            {/* Code Word Input */}
            <div className={styles.formGroup}>
              <label htmlFor="codeWord" className={styles.label}>
                Кодовое слово
              </label>
              <div className={styles.inputContainer}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  id="codeWord"
                  type="text"
                  className={`${styles.input} ${errors.codeWord ? styles.inputError : ''}`}
                  placeholder="Введите кодовое слово"
                  autoComplete="off"
                  {...register('codeWord', {
                    required: 'Кодовое слово обязательно для регистрации',
                  })}
                />
              </div>
              {errors.codeWord && (
                <p className={styles.errorMessage}>{errors.codeWord.message}</p>
              )}
              {formError && !errors.codeWord && (
                <p className={styles.errorMessage}>{formError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          {/* Login Link */}
          <div className={styles.signupContainer}>
            Уже есть аккаунт?{' '}
            <Link to="/login" className={styles.signupLink}>
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 