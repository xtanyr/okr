import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import GoalActions from './GoalActions';
import type { KeyResult } from '../types';
import styles from '../pages/Dashboard.module.css';

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    keyResults: KeyResult[];
    order?: number;
  };
  onDeleteGoal: (goalId: string) => void;
  onDuplicateGoal: (goalId: string) => void;
  readOnly?: boolean;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onDeleteGoal,
  onDuplicateGoal,
  readOnly = false
}) => {
  const handleEdit = () => {
    // Handle edit logic
  };

  const handleDelete = async (goalId: string) => {
    await onDeleteGoal(goalId);
  };

  const handleDuplicate = (goal: any) => {
    onDuplicateGoal(goal.id);
  };

  const handleToggleArchive = async () => {
  };

  return (
    <Card className={styles.goalCard} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h3">
            {goal.title}
          </Typography>
          {!readOnly && (
            <GoalActions
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onToggleArchive={handleToggleArchive}
              size="small"
            />
          )}
        </Box>
        
        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Ключевые результаты ({goal.keyResults.length})
          </Typography>
          {goal.keyResults.length === 0 ? (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              Нет ключевых результатов
            </Typography>
          ) : (
            <Box>
              {goal.keyResults.map((kr) => (
                <Box key={kr.id} mb={1} p={1} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="body2">
                    {kr.title}: {kr.fact} / {kr.plan} {kr.metric}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default GoalCard;
