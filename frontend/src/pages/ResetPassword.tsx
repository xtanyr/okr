import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Login.module.css';

interface ResetPasswordForm {
  password: string;
  passwordConfirm: string;
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>();
  const password = watch('password');

  useEffect(() => {
    setIsValidToken(!!token);
    setIsLoading(false);
  }, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;
    
    setIsSubmitting(true);
    try {
      await axios.post('/auth/reset-password', {
        token,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });
      
      toast.success('Пароль успешно изменен!');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Произошла ошибка. Пожалуйста, попробуйте снова.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loginContainer}><div className={styles.loginCard}><div className={styles.loginContent}>Проверка...</div></div></div>;
  }

  if (!isValidToken) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginContent}>
            <h1 className={styles.title}>Неверная ссылка</h1>
            <p>Ссылка недействительна или устарела.</p>
            <div className={styles.signupContainer}>
              <Link to="/forgot-password" className={styles.signupLink}>
                Запросить новую ссылку
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginContent}>
          <h1 className={styles.title}>Новый пароль</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGroup}>
              <label>Новый пароль</label>
              <input
                type="password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Пароль обязателен',
                  minLength: { value: 6, message: 'Минимум 6 символов' },
                })}
              />
              {errors.password && <p className={styles.errorMessage}>{errors.password.message}</p>}
            </div>

            <div className={styles.formGroup}>
              <label>Подтвердите пароль</label>
              <input
                type="password"
                className={`${styles.input} ${errors.passwordConfirm ? styles.inputError : ''}`}
                placeholder="••••••••"
                {...register('passwordConfirm', {
                  required: 'Подтвердите пароль',
                  validate: value => value === password || 'Пароли не совпадают'
                })}
              />
              {errors.passwordConfirm && <p className={styles.errorMessage}>{errors.passwordConfirm.message}</p>}
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить пароль'}
            </button>
          </form>
          
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
