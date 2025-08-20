import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import type { KeyResult } from '../types';

interface KeyResultTableHeaderProps {
  icon?: React.ReactNode;
  weeks?: number[];
  weekRanges?: { start: Date; end: Date }[];
  isCurrentWeek?: (week: number) => boolean;
  showWeeklyMonitoring?: boolean;
  keyResults?: KeyResult[];
}

const KeyResultTableHeader: React.FC<KeyResultTableHeaderProps> = ({ icon, weeks = [], isCurrentWeek = () => false, showWeeklyMonitoring = false, keyResults = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Функция для расчета процента выполнения недели
  const calculateWeekProgress = (week: number): number => {
    if (!keyResults.length) return 0;
    
    let totalProgress = 0;
    let validKRs = 0;
    
    keyResults.forEach(kr => {
      if (kr.plan > 0 && kr.weeklyValues?.[week] !== undefined) {
        const weekValue = kr.weeklyValues[week] || 0;
        const progress = (weekValue / kr.plan) * 100;
        totalProgress += progress;
        validKRs++;
      }
    });
    
    return validKRs > 0 ? Math.round(totalProgress / validKRs) : 0;
  };
  
  return (
    <thead>
      {/* Строка с процентами выполнения недель */}
      {showWeeklyMonitoring && (
        <tr style={{
          background: '#fafafa',
          height: 32,
          borderBottom: '1px solid #e5e7eb'
        }}>
          {/* Пустые ячейки для основных колонок */}
          <th style={{ width: isMobile ? '60px' : '80px' }}></th>
          <th style={{ width: isMobile ? '40px' : '50px' }}></th>
          <th style={{ width: isMobile ? '120px' : '200px' }}></th>
          <th style={{ width: isMobile ? '60px' : '80px' }}></th>
          <th style={{ width: isMobile ? '50px' : '70px' }}></th>
          <th style={{ width: isMobile ? '50px' : '70px' }}></th>
          <th style={{ width: isMobile ? '50px' : '70px' }}></th>
          {/* Проценты для каждой недели */}
          {weeks.map((week) => {
            const progress = calculateWeekProgress(week);
            return (
              <th key={`progress-${week}`} style={{
                width: isMobile ? 40 : 48,
                minWidth: isMobile ? 40 : 48,
                maxWidth: isMobile ? 40 : 48,
                textAlign: 'center',
                padding: isMobile ? '2px 1px' : '4px 2px',
                fontSize: isMobile ? 10 : 11,
                fontWeight: 600,
                color: progress >= 100 ? '#059669' : progress >= 50 ? '#d97706' : '#dc2626',
                background: 'transparent'
              }}>
                {progress > 0 ? `${progress}%` : ''}
              </th>
            );
          })}
          <th style={{ width: isMobile ? '40px' : '50px' }}></th>
        </tr>
      )}
      {/* Основная строка заголовков */}
      <tr style={{
        background: '#fff',
        borderRadius: isMobile ? 6 : 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        fontWeight: 600,
        fontSize: isMobile ? 11 : 12,
        color: '#1a202c',
        height: isMobile ? 32 : 36,
        fontFamily: 'Inter, Roboto, Arial, sans-serif',
      }}>
      <th style={{ 
        padding: isMobile ? '2px 1px' : '4px 1px', 
        fontWeight: 600, 
        fontSize: isMobile ? 9 : 10, 
        color: '#64748b', 
        background: 'transparent', 
        border: 'none', 
        textAlign: 'center', 
        whiteSpace: 'nowrap', 
        width: isMobile ? '36px' : '44px', 
        minWidth: isMobile ? '36px' : '44px', 
        maxWidth: isMobile ? '36px' : '44px' 
      }}>Прогресс</th>
      <th style={{ 
        padding: isMobile ? '2px 1px' : '4px 1px', 
        fontWeight: 600, 
        fontSize: isMobile ? 9 : 10, 
        color: '#64748b', 
        background: 'transparent', 
        border: 'none', 
        textAlign: 'center', 
        whiteSpace: 'nowrap', 
        width: isMobile ? '20px' : '28px', 
        minWidth: isMobile ? '20px' : '28px', 
        maxWidth: isMobile ? '20px' : '28px' 
      }}>№</th>
      <th style={{ 
        padding: isMobile ? '4px 4px' : '6px 6px', 
        fontWeight: 600, 
        fontSize: isMobile ? 10 : 11, 
        color: '#1a202c', 
        background: 'transparent', 
        border: 'none', 
        textAlign: 'left', 
        whiteSpace: isMobile ? 'normal' : 'nowrap', 
        width: isMobile ? '180px' : '240px', 
        minWidth: isMobile ? '180px' : '240px', 
        maxWidth: isMobile ? '180px' : '240px' 
      }}>Ключевой результат</th>
      <th style={{ 
        padding: isMobile ? '2px 1px' : '4px 1px', 
        fontWeight: 600, 
        fontSize: isMobile ? 9 : 10, 
        color: '#64748b', 
        background: 'transparent', 
        border: 'none', 
        textAlign: 'center', 
        whiteSpace: 'nowrap', 
        width: isMobile ? '32px' : '40px', 
        minWidth: isMobile ? '32px' : '40px', 
        maxWidth: isMobile ? '32px' : '40px' 
      }}>Метрика</th>
      <th style={{ 
        padding: isMobile ? '2px 1px' : '4px 1px', 
        fontWeight: 600, 
        fontSize: isMobile ? 9 : 10, 
        color: '#64748b', 
        background: 'transparent', 
        border: 'none', 
        textAlign: 'center', 
        whiteSpace: 'nowrap', 
        width: isMobile ? '32px' : '40px', 
        minWidth: isMobile ? '32px' : '40px', 
        maxWidth: isMobile ? '32px' : '40px' 
      }}>База</th>
      <th style={{ 
        padding: isMobile ? '2px 1px' : '4px 1px', 
        fontWeight: 600, 
        fontSize: isMobile ? 9 : 10, 
        color: '#64748b', 
        background: 'transparent', 
        border: 'none', 
        textAlign: 'center', 
        whiteSpace: 'nowrap', 
        width: isMobile ? '32px' : '40px', 
        minWidth: isMobile ? '32px' : '40px', 
        maxWidth: isMobile ? '32px' : '40px' 
      }}>План</th>
      <th style={{ 
        padding: isMobile ? '2px 1px' : '4px 1px', 
        fontWeight: 600, 
        fontSize: isMobile ? 9 : 10, 
        color: '#64748b', 
        background: 'transparent', 
        border: 'none', 
        textAlign: 'center', 
        whiteSpace: 'nowrap', 
        width: isMobile ? '32px' : '40px', 
        minWidth: isMobile ? '32px' : '40px', 
        maxWidth: isMobile ? '32px' : '40px' 
      }}>Факт</th>
      {showWeeklyMonitoring ? (
        weeks.map((week) => {
          const isCurrent = isCurrentWeek(week);
          return (
            <th key={week} style={{
              minWidth: isMobile ? 40 : 48,
              maxWidth: isMobile ? 40 : 48,
              width: isMobile ? 40 : 48,
              textAlign: 'center',
              fontWeight: isCurrent ? 600 : 500,
              fontSize: isMobile ? 11 : 13,
              color: isCurrent ? '#1976d2' : '#888',
              background: isCurrent ? '#e3f2fd' : '#f7f8fa',
              padding: isMobile ? '2px 2px 4px' : '2px 2px 6px',
              borderTop: '1px solid #eee',
              borderBottom: '1px solid #eee',
              transition: 'background 0.2s, color 0.2s',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                height: '100%',
                width: '100%'
              }}>
                {/* Progress percentage */}
                <div style={{
                  fontSize: isMobile ? 9 : 10,
                  fontWeight: 600,
                  color: '#6b7280',
                  lineHeight: 1,
                  height: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {calculateWeekProgress(week)}%
                </div>
                {/* Week number */}
                <div style={{
                  cursor: 'pointer',
                  color: isCurrent ? '#059669' : '#6b7280',
                  fontWeight: isCurrent ? 700 : 500,
                  padding: isMobile ? '1px 2px' : '2px 4px',
                  borderRadius: isMobile ? '3px' : '4px',
                  backgroundColor: isCurrent ? '#ecfdf5' : 'transparent',
                  border: isCurrent ? '1px solid #10b981' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  fontSize: isMobile ? 10 : 12,
                  lineHeight: 1
                }}>
                  {week}
                </div>
              </div>
            </th>
          );
        })
      ) : null}
      {/* Remove the old weeks.map since it's now conditional above */}

      <th style={{ 
        padding: isMobile ? '8px 4px' : '12px 8px', 
        background: 'transparent', 
        border: 'none', 
        width: isMobile ? '40px' : '50px', 
        minWidth: isMobile ? '40px' : '50px', 
        maxWidth: isMobile ? '40px' : '50px' 
      }}></th>
    </tr>
    {icon && (
      <tr>
        <td colSpan={showWeeklyMonitoring ? 7 + weeks.length + 2 : 9 + 2} style={{ textAlign: 'right', padding: 0 }}>{icon}</td>
      </tr>
    )}
    </thead>
  );
};

export default KeyResultTableHeader;