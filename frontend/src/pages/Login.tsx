import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Login.module.css';

interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');
  const login = useUserStore((s) => s.login);
  const token = useUserStore((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setLoginError('');
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/login', data);
      login(res.data.user, res.data.token);
      toast.success('Вход выполнен успешно!');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Неверный email или пароль';
      setLoginError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginContent}>
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
            <h1 className={styles.title}>Добро пожаловать</h1>
            <p className={styles.subtitle}>Войдите в свой аккаунт OKR</p>
          </div>

          {/* Form */}
          {loginError && (
            <div className={styles.errorAlert}>
              <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {loginError}
            </div>
          )}
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
                  type="password"
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
              </div>
              {errors.password && (
                <p className={styles.errorMessage}>{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot */}
            <div className={styles.rememberForgot}>
              <label className={styles.rememberLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  {...register('rememberMe')}
                />
                Запомнить меня
              </label>
              <Link 
                to="/forgot-password" 
                className={styles.forgotLink}
              >
                Забыли пароль?
              </Link>
            </div>

            {/* Sign In Button */}
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className={styles.signupContainer}>
            Нет аккаунта?{' '}
            <Link to="/register" className={styles.signupLink}>
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}