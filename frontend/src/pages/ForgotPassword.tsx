import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Login.module.css';

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await axios.post('/auth/forgot-password', { email: data.email });
      setEmailSent(true);
      toast.success('Если аккаунт с таким email существует, на него было отправлено письмо с инструкциями.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Произошла ошибка. Пожалуйста, попробуйте снова.';
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

          <div>
            <h1 className={styles.title}>Восстановление пароля</h1>
            <p className={styles.subtitle}>Введите email, указанный при регистрации</p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit(onSubmit)}>
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

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Отправка...' : 'Отправить ссылку для сброса'}
              </button>
            </form>
          ) : (
            <div className={styles.successMessage}>
              <p>Письмо с инструкциями по сбросу пароля было отправлено на ваш email.</p>
              <p>Пожалуйста, проверьте вашу почту и следуйте инструкциям в письме.</p>
            </div>
          )}

          <div className={styles.signupContainer}>
            <Link to="/login" className={styles.signupLink}>
              Вернуться на страницу входа
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
