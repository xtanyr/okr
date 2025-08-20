import React from 'react';
import { User } from '../types';
import styles from '../pages/Dashboard.module.css';

interface DashboardHeaderProps {
  title: string;
  user: User | null;
  onAddClick?: () => void;
  onViewChange?: (view: string) => void;
  activeView?: string;
  views?: string[];
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  user,
  onAddClick,
  onViewChange,
  activeView = 'dashboard',
  views = ['dashboard', 'archived'],
  className = ''
}) => {
  return (
    <div className={`${styles.header} ${className}`}>
      <div>
        <h1 className={styles.headerTitle}>{title}</h1>
        {user && (
          <p className={styles.headerSubtitle}>
            Добро пожаловать, {user.name || user.email}
          </p>
        )}
      </div>
      
      <div className={styles.headerActions}>
        {views.length > 0 && (
          <div className={styles.viewTabs}>
            {views.map((view) => (
              <button
                key={view}
                className={`${styles.tab} ${
                  activeView === view ? styles.tabActive : ''
                }`}
                onClick={() => onViewChange?.(view)}
              >
                {view === 'dashboard' ? 'Активные' : 'Архив'}
              </button>
            ))}
          </div>
        )}
        
        {onAddClick && (
          <button
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={onAddClick}
          >
            Добавить OKR
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
