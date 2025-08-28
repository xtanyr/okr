import React, { type ReactNode } from 'react';
import styles from '../pages/Dashboard.module.css';

interface DashboardCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  noPadding?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  className = '',
  headerActions,
  noPadding = false
}) => {
  return (
    <div className={`${styles.card} ${className}`}>
      {(title || headerActions) && (
        <div className={styles.cardHeader}>
          {title && <h2 className={styles.cardTitle}>{title}</h2>}
          {headerActions && (
            <div className={styles.cardHeaderActions}>
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className={`${styles.cardContent} ${noPadding ? styles.noPadding : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
