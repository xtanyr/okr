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

const KeyResultTableHeader: React.FC<KeyResultTableHeaderProps> = ({
  icon,
  weeks = [],
  isCurrentWeek = () => false,
  showWeeklyMonitoring = false,
  keyResults = []
}) => {
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
          height: isMobile ? 20 : 32,
          borderBottom: '1px solid #e5e7eb'
        }}>
          {/* Пустые ячейки для основных колонок */}
          <th style={{ width: 36, padding: 0, border: 'none' }}></th>
          <th style={{ width: 28, padding: 0, border: 'none' }}></th>
          <th style={{ width: isMobile ? 120 : 240, padding: 0, border: 'none' }}></th>
          <th style={{ width: 40, padding: 0, border: 'none' }}></th>
          <th style={{ width: 40, padding: 0, border: 'none' }}></th>
          <th style={{ width: 40, padding: 0, border: 'none' }}></th>
          <th style={{ width: 40, padding: 0, border: 'none' }}></th>
          <th style={{ width: 70, padding: 0, border: 'none' }}></th>
          {/* Проценты для каждой недели */}
          {weeks.map((week) => {
            const progress = calculateWeekProgress(week);
            return (
              <th
                key={`progress-${week}`}
                style={{
                  width: isMobile ? 40 : 48,
                  textAlign: 'center',
                  padding: isMobile ? '1px' : '2px',
                  fontSize: isMobile ? 9 : 10,
                  fontWeight: 600,
                  color: progress >= 100 ? '#059669' : progress >= 50 ? '#d97706' : '#dc2626',
                  background: 'transparent',
                  border: 'none',
                  lineHeight: 1
                }}
              >
                {progress > 0 ? `${progress}%` : ''}
              </th>
            );
          })}
          <th style={{ width: isMobile ? 40 : 50, padding: 0, border: 'none' }}></th>
        </tr>
      )}

      {/* Основная строка заголовков */}
      <tr style={{
        background: '#fff',
        borderRadius: isMobile ? 6 : 8,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        fontWeight: 600,
        fontSize: isMobile ? 13 : 14,
        color: '#1a202c',
        height: isMobile ? 32 : 36,
        fontFamily: 'Inter, Roboto, Arial, sans-serif',
      }}>
        <th style={{
          padding: isMobile ? '2px 1px' : '4px 1px',
          fontWeight: 600,
          fontSize: isMobile ? 11 : 12,
          color: '#64748b',
          background: 'transparent',
          border: 'none',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          width: 36
        }}>Прогресс</th>
        <th style={{
          padding: isMobile ? '2px 1px' : '4px 1px',
          fontWeight: 600,
          fontSize: isMobile ? 11 : 12,
          color: '#64748b',
          background: 'transparent',
          border: 'none',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          width: 28
        }}>№</th>
        <th style={{
          padding: isMobile ? '4px 4px' : '6px 6px',
          fontWeight: 600,
          fontSize: isMobile ? 12 : 13,
          color: '#1a202c',
          background: 'transparent',
          border: 'none',
          textAlign: 'left',
          whiteSpace: isMobile ? 'normal' : 'nowrap',
          wordBreak: 'break-word',
          width: isMobile ? 120 : 240
        }}>Ключевой результат</th>
        <th style={{
          padding: isMobile ? '2px 1px' : '4px 1px',
          fontWeight: 600,
          fontSize: isMobile ? 11 : 12,
          color: '#64748b',
          background: 'transparent',
          border: 'none',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          width: 40
        }}>Метрика</th>
        <th style={{
          padding: isMobile ? '2px 1px' : '4px 1px',
          fontWeight: 600,
          fontSize: isMobile ? 11 : 12,
          color: '#64748b',
          background: 'transparent',
          border: 'none',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          width: 40
        }}>База</th>
        <th style={{
          padding: isMobile ? '2px 1px' : '4px 1px',
          fontWeight: 600,
          fontSize: isMobile ? 11 : 12,
          color: '#64748b',
          background: 'transparent',
          border: 'none',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          width: 40
        }}>План</th>
        <th style={{
          padding: isMobile ? '2px 1px' : '4px 1px',
          fontWeight: 600,
          fontSize: isMobile ? 11 : 12,
          color: '#64748b',
          background: 'transparent',
          border: 'none',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          width: 40
        }}>Факт</th>
        <th style={{
          padding: isMobile ? '2px 1px' : '4px 1px',
          fontWeight: 600,
          fontSize: isMobile ? 11 : 12,
          color: '#64748b',
          background: 'transparent',
          border: 'none',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          width: 70
        }}>Формула</th>
        {showWeeklyMonitoring && weeks.map((week) => {
          const isCurrent = isCurrentWeek(week);
          return (
            <th
              key={week}
              style={{
                minWidth: isMobile ? 40 : 48,
                maxWidth: isMobile ? 40 : 48,
                textAlign: 'center',
                fontWeight: isCurrent ? 600 : 500,
                fontSize: isMobile ? 10 : 12,
                color: isCurrent ? '#1976d2' : '#888',
                background: isCurrent ? '#e3f2fd' : '#f7f8fa',
                padding: isMobile ? '4px 1px' : '6px 2px',
                borderTop: '1px solid #eee',
                borderBottom: '1px solid #eee',
                border: 'none'
              }}
            >
              <div style={{
                cursor: 'pointer',
                color: isCurrent ? '#059669' : '#6b7280',
                fontWeight: isCurrent ? 700 : 500,
                padding: isMobile ? '1px' : '2px 4px',
                borderRadius: isMobile ? '2px' : '4px',
                backgroundColor: isCurrent ? '#ecfdf5' : 'transparent',
                border: isCurrent ? '1px solid #10b981' : '1px solid transparent',
                fontSize: isMobile ? 9 : 11,
                lineHeight: 1,
                whiteSpace: 'nowrap'
              }}>
                {week}
              </div>
            </th>
          );
        })}
        <th style={{
          padding: isMobile ? '8px 4px' : '12px 8px',
          background: 'transparent',
          border: 'none',
          width: isMobile ? 40 : 50
        }}></th>
      </tr>

      {icon && (
        <tr>
          <td colSpan={showWeeklyMonitoring ? 8 + weeks.length + 2 : 8 + 2} style={{ textAlign: 'right', padding: 0 }}>
            {icon}
          </td>
        </tr>
      )}
    </thead>
  );
};

export default KeyResultTableHeader;