import React from 'react';
import { Stack, Box, Button } from '@mui/material';
import GoalItem from '../../components/GoalItem';
import type { KeyResult } from '../../types';

interface Goal {
  id: string;
  title: string;
  keyResults: KeyResult[];
  order?: number;
}

interface GoalsListProps {
  goals: Goal[];
  okrId: string;
  archived: boolean;
  readOnly: boolean;
  showWeeklyMonitoring: boolean;
  startDate?: string;
  endDate?: string;
  isViewingOwnOkrs: boolean;
  onGoalChange: (goal: Goal) => void;
  onAddGoalClick: () => void;
  onAddKR: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onDeleteKR: (krId: string) => void;
  onDuplicateGoal: (goalId: string) => void;
  onDuplicateKR: (krId: string) => void;
}

const GoalsList: React.FC<GoalsListProps> = ({
  goals,
  okrId,
  archived,
  readOnly,
  showWeeklyMonitoring,
  startDate,
  endDate,
  isViewingOwnOkrs,
  onGoalChange,
  onAddGoalClick,
  onAddKR,
  onDeleteGoal,
  onDeleteKR,
  onDuplicateGoal,
  onDuplicateKR,
}) => {
  return (
    <Stack spacing={{ xs: 1, sm: 2, md: 3 }}>
      {goals.map(goal => (
        <GoalItem
          key={goal.id + '-' + okrId}
          goal={goal}
          okrId={okrId}
          onGoalChange={(g) => onGoalChange(g)}
          onAddKR={onAddKR}
          onDeleteGoal={onDeleteGoal}
          onDeleteKR={onDeleteKR}
          onDuplicateGoal={onDuplicateGoal}
          onDuplicateKR={onDuplicateKR}
          archived={archived}
          showWeeklyMonitoring={showWeeklyMonitoring}
          mode="weeks"
          startDate={startDate}
          endDate={endDate}
          readOnly={readOnly}
        />
      ))}
      {isViewingOwnOkrs && (
        <Box display="flex" alignItems="center" mt={2}>
          <Button 
            variant="outlined" 
            onClick={onAddGoalClick} 
            disabled={archived}
            sx={{ mb: 2 }}
          >
            Добавить цель
          </Button>
        </Box>
      )}
    </Stack>
  );
};

export default GoalsList;
