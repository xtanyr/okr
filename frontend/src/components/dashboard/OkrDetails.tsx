import React, { useState } from 'react';
import type { KeyResult } from '../../types';
import GoalsList from './GoalsList';
import CreateGoalDialog from './dialogs/CreateGoalDialog';
import CreateKrDialog from './dialogs/CreateKrDialog';

interface Goal {
  id: string;
  title: string;
  keyResults: KeyResult[];
  order?: number;
}

interface OKR {
  id: string;
  period: string;
  archived: boolean;
  goals: Goal[];
  startDate?: string;
  endDate?: string;
}

interface OkrDetailsProps {
  okr: OKR;
  isViewingOwnOkrs: boolean;
  showWeeklyMonitoring: boolean;
  onGoalChange: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onDeleteKR: (krId: string) => void;
  onDuplicateGoal: (goalId: string) => void;
  onDuplicateKR: (krId: string) => void;
  onCreateGoal: (title: string) => Promise<void> | void;
  onCreateKr: (goalId: string, title: string) => Promise<void> | void;
}

const OkrDetails: React.FC<OkrDetailsProps> = ({
  okr,
  isViewingOwnOkrs,
  showWeeklyMonitoring,
  onGoalChange,
  onDeleteGoal,
  onDeleteKR,
  onDuplicateGoal,
  onDuplicateKR,
  onCreateGoal,
  onCreateKr,
}) => {
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [krDialogOpen, setKrDialogOpen] = useState(false);
  const [krGoalId, setKrGoalId] = useState<string | null>(null);
  const [newKrTitle, setNewKrTitle] = useState('');

  const readOnly = !isViewingOwnOkrs || okr.archived;

  const handleAddKR = (goalId: string) => {
    if (okr.archived) return;
    setKrGoalId(goalId);
    setNewKrTitle('');
    setKrDialogOpen(true);
  };

  const handleCreateGoal = async () => {
    const title = newGoalTitle.trim();
    if (!title) return;
    await onCreateGoal(title);
    setNewGoalTitle('');
    setGoalDialogOpen(false);
  };

  const handleCreateKr = async () => {
    const title = newKrTitle.trim();
    if (!title || !krGoalId) return;
    await onCreateKr(krGoalId, title);
    setNewKrTitle('');
    setKrDialogOpen(false);
  };

  return (
    <>
      <GoalsList
        goals={okr.goals}
        okrId={okr.id}
        archived={okr.archived}
        readOnly={readOnly}
        showWeeklyMonitoring={showWeeklyMonitoring}
        startDate={okr.startDate}
        endDate={okr.endDate}
        isViewingOwnOkrs={isViewingOwnOkrs}
        onGoalChange={onGoalChange}
        onAddGoalClick={() => setGoalDialogOpen(true)}
        onAddKR={handleAddKR}
        onDeleteGoal={onDeleteGoal}
        onDeleteKR={onDeleteKR}
        onDuplicateGoal={onDuplicateGoal}
        onDuplicateKR={onDuplicateKR}
      />

      {/* Dialogs */}
      <CreateGoalDialog
        open={goalDialogOpen}
        value={newGoalTitle}
        onChange={setNewGoalTitle}
        onClose={() => setGoalDialogOpen(false)}
        onSubmit={handleCreateGoal}
      />

      <CreateKrDialog
        open={krDialogOpen}
        value={newKrTitle}
        onChange={setNewKrTitle}
        onClose={() => setKrDialogOpen(false)}
        onSubmit={handleCreateKr}
      />
    </>
  );
};

export default OkrDetails;
