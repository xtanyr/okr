import React from 'react';
import { Box, Typography, IconButton, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { Edit, Delete, ContentCopy, ExpandMore, ExpandLess } from '@mui/icons-material';
import { KeyResult } from '../types';
import KeyResultRow from './KeyResultRow';
import KeyResultTableHeader from './KeyResultTableHeader';
import styles from '../pages/Dashboard.module.css';

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description?: string;
    progress: number;
    status: 'on_track' | 'at_risk' | 'off_track' | 'completed';
    keyResults: Array<KeyResult & { formula?: string; comment?: string }>;
  };
  index: number;
  onEditGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onDuplicateGoal: (goalId: string) => void;
  onEditKeyResult: (keyResultId: string, updates: any) => void;
  onDeleteKeyResult: (keyResultId: string) => void;
  onDuplicateKeyResult: (keyResultId: string) => void;
  weeks?: number[];
  weekRanges?: { start: Date; end: Date }[];
  isCurrentWeek?: (week: number) => boolean;
  showWeeklyMonitoring?: boolean;
  readOnly?: boolean;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  index,
  onEditGoal,
  onDeleteGoal,
  onDuplicateGoal,
  onEditKeyResult,
  onDeleteKeyResult,
  onDuplicateKeyResult,
  weeks = [],
  weekRanges = [],
  isCurrentWeek = () => false,
  showWeeklyMonitoring = false,
  readOnly = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = React.useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  const statusColors = {
    on_track: '#10b981',
    at_risk: '#f59e0b',
    off_track: '#ef4444',
    completed: '#3b82f6'
  };

  const statusLabels = {
    on_track: 'В плане',
    at_risk: 'Под угрозой',
    off_track: 'Отстает',
    completed: 'Завершено'
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteGoal(goal.id);
    setShowConfirmDelete(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
  };

  return (
    <Box className={styles.goalCard}>
      <Box 
        className={styles.goalCardHeader}
        onClick={handleToggleExpand}
        sx={{
          cursor: 'pointer',
          borderLeft: `4px solid ${statusColors[goal.status]}`,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)'
          }
        }}
      >
        <Box className={styles.goalCardTitle}>
          <Box className={styles.goalCardExpand}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </Box>
          <Typography variant="h6" className={styles.goalTitle}>
            {goal.title}
          </Typography>
          <Box 
            className={styles.goalStatus}
            sx={{
              backgroundColor: `${statusColors[goal.status]}15`,
              color: statusColors[goal.status],
              border: `1px solid ${statusColors[goal.status]}40`,
              marginLeft: 'auto',
              marginRight: '1rem'
            }}
          >
            {statusLabels[goal.status]}
          </Box>
          <Box className={styles.goalProgressContainer}>
            <Box className={styles.goalProgressBar}>
              <Box 
                className={styles.goalProgressFill}
                sx={{
                  width: `${goal.progress}%`,
                  backgroundColor: statusColors[goal.status]
                }}
              />
            </Box>
            <Typography variant="body2" className={styles.goalProgressText}>
              {Math.round(goal.progress)}%
            </Typography>
          </Box>
        </Box>
        
        {!readOnly && (
          <Box className={styles.goalActions} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Редактировать цель">
              <IconButton 
                size="small" 
                onClick={() => onEditGoal(goal.id)}
                className={styles.actionButton}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Дублировать цель">
              <IconButton 
                size="small" 
                onClick={() => onDuplicateGoal(goal.id)}
                className={styles.actionButton}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={showConfirmDelete ? 'Подтвердите удаление' : 'Удалить цель'}>
              <IconButton 
                size="small" 
                onClick={showConfirmDelete ? handleConfirmDelete : handleDeleteClick}
                className={`${styles.actionButton} ${showConfirmDelete ? styles.deleteConfirm : ''}`}
                sx={{
                  '&:hover': {
                    color: showConfirmDelete ? '#fff' : undefined,
                    backgroundColor: showConfirmDelete ? '#ef4444' : undefined
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
            {showConfirmDelete && (
              <Typography 
                variant="caption" 
                className={styles.deleteConfirmText}
                onClick={handleCancelDelete}
                sx={{
                  cursor: 'pointer',
                  color: '#6b7280',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Отмена
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {expanded && (
        <Box className={styles.goalCardContent}>
          {goal.description && (
            <Typography variant="body2" className={styles.goalDescription}>
              {goal.description}
            </Typography>
          )}
          
          {goal.keyResults.length > 0 ? (
            <Box className={styles.keyResultsContainer}>
              <KeyResultTableHeader 
                weeks={weeks}
                weekRanges={weekRanges}
                isCurrentWeek={isCurrentWeek}
                showWeeklyMonitoring={showWeeklyMonitoring}
                keyResults={goal.keyResults}
              />
              <Box className={styles.keyResultsList}>
                {goal.keyResults.map((kr, idx) => (
                  <KeyResultRow
                    key={kr.id}
                    kr={kr}
                    index={idx}
                    editKR={null}
                    editValue={null}
                    archived={false}
                    onEditCell={() => {}}
                    onSaveCell={() => {}}
                    onDuplicateKR={onDuplicateKeyResult}
                    onDeleteKR={onDeleteKeyResult}
                    setEditValue={() => {}}
                    loading={false}
                    readOnly={readOnly}
                    weeks={weeks}
                    weeklyValues={kr.weeklyValues || {}}
                    weeklyEdit={{}}
                    weeklyLoading={false}
                    isCurrentWeek={isCurrentWeek}
                    onWeeklyChange={() => {}}
                    onWeeklySave={() => {}}
                    onWeeklyEdit={() => {}}
                    formulas={[]}
                    onFormulaChange={() => {}}
                    savingFormula={false}
                    showWeeklyMonitoring={showWeeklyMonitoring}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            <Box className={styles.noKeyResults}>
              <Typography variant="body2" color="textSecondary">
                Нет ключевых результатов. {!readOnly && 'Добавьте ключевой результат, чтобы отслеживать прогресс.'}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default GoalCard;
