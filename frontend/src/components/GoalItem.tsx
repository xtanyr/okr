import React from 'react';
import { Box, Stack, Typography, TextField, Button, IconButton, Tooltip, Dialog, DialogTitle, DialogActions } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import WeeklyMonitoringTable from './WeeklyMonitoringTable';
import KeyResultRow from './KeyResultRow';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

interface KeyResult {
  id: string;
  title: string;
  metric: string;
  base: number;
  plan: number;
  formula: string;
  fact: number;
  order: number;
}
interface Goal {
  id: string;
  title: string;
  keyInitiatives: string;
  keyResults: KeyResult[];
  order?: number;
}

interface GoalItemProps {
  goal: Goal;
  okrId: string;
  onGoalChange: (g: Goal) => void;
  onAddKR: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onDeleteKR: (krId: string) => void;
  onDuplicateGoal: (goalId: string) => void;
  onDuplicateKR: (krId: string) => void;
  archived: boolean;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, okrId, onGoalChange, onAddKR, archived }) => {
  const queryClient = useQueryClient();
  const [, setSaving] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [editKR, setEditKR] = React.useState<{ krId: string; field: keyof KeyResult } | null>(null);
  const [editValue, setEditValue] = React.useState<any>(null);
  // Добавить состояние editTitle и editTitleValue
  const [editTitle, setEditTitle] = React.useState(false);
  const [editTitleValue, setEditTitleValue] = React.useState(goal.title);

  // useEffect: обновлять локальное состояние инициативы только если оно реально изменилось на сервере
  React.useEffect(() => {
    // No need to update initiatives here as the field is removed
  }, [goal.keyInitiatives]);

  // Сохранять инициативу только на blur (или debounce), а не на каждый onChange


  // Для KR: редактирование только локально, invalidateQueries только после onBlur (handleSaveCell)
  const handleEditCell = (krId: string, field: keyof KeyResult, value: any) => {
    setEditKR({ krId, field });
    setEditValue(value);
  };
  const handleSaveCell = async (kr: KeyResult, field: keyof KeyResult) => {
    setEditKR(null);
    const updatedKR = { ...kr, [field]: editValue };
    if (!updatedKR.title || typeof updatedKR.metric !== 'string' || !updatedKR.metric || updatedKR.base === undefined || updatedKR.plan === undefined || !updatedKR.formula) {
      alert('Все поля (название, метрика, база, план, формула) должны быть заполнены!');
      return;
    }
    const res = await axios.put(`/okr/goal/${goal.id}/keyresult/${kr.id}`, {
      title: updatedKR.title,
      metric: updatedKR.metric,
      base: updatedKR.base,
      plan: updatedKR.plan,
      formula: updatedKR.formula,
      fact: updatedKR.fact,
    });
    // Немедленно обновить KR в goal и вызвать onGoalChange
    const newKeyResults = goal.keyResults.map(k => k.id === kr.id ? { ...k, ...res.data } : k);
    onGoalChange({ ...goal, keyResults: newKeyResults });
  };
  const handleDuplicateKR = async (krId: string) => {
    await axios.post(`/okr/goal/${goal.id}/keyresult/${krId}/duplicate`);
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };
  const handleDeleteKR = async (krId: string) => {
    await axios.delete(`/okr/goal/${goal.id}/keyresult/${krId}`);
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };
  const handleDuplicateGoal = async () => {
    await axios.post(`/okr/goal/${goal.id}/duplicate`);
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };
  const handleDeleteGoal = async () => {
    await axios.delete(`/okr/${okrId}/goal/${goal.id}`);
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };

  // Функция для сохранения нового названия
  const saveTitle = async () => {
    if (editTitleValue.trim() && editTitleValue !== goal.title) {
      setSaving(true);
      const res = await axios.put(`/okr/${okrId}/goal/${goal.id}`, {
        title: editTitleValue,
        keyInitiatives: goal.keyInitiatives,
      });
      setSaving(false);
      setEditTitle(false);
      setEditTitleValue(res.data.title);
      onGoalChange(res.data);
    } else {
      setEditTitle(false);
      setEditTitleValue(goal.title);
    }
  };

  // 1. Перед заголовком цели (или в Stack), добавить визуальный блок среднего прогресса:
  //   const avgProgress = goal.keyResults.length > 0 ? Math.round(goal.keyResults.reduce((sum, kr) => sum + (kr.plan > 0 ? (kr.fact / kr.plan) * 100 : 0), 0) / goal.keyResults.length) : 0;
  //   <Box ...>{avgProgress}%</Box>
  const avgProgress = goal.keyResults.length > 0 ? Math.round(goal.keyResults.reduce((sum, kr) => sum + (kr.plan > 0 ? (kr.fact / kr.plan) * 100 : 0), 0) / goal.keyResults.length) : 0;

  return (
    <Box key={goal.id} sx={{ mb: 2 }}>
      {/* --- Визуальный блок среднего прогресса слева от заголовка цели --- */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '50%',
          background: avgProgress >= 80 ? '#e6f4ea' : avgProgress >= 40 ? '#fff7e6' : '#fdeaea',
          color: avgProgress >= 80 ? '#43a047' : avgProgress >= 40 ? '#ffb300' : '#ef5350',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>{avgProgress}%</Box>
        {/* Заголовок цели */}
        {editTitle ? (
          <TextField
            value={editTitleValue}
            onChange={e => setEditTitleValue(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setEditTitle(false); setEditTitleValue(goal.title); } }}
            size="small"
            autoFocus
            sx={{ fontWeight: 600, fontSize: 18, minWidth: 180 }}
            disabled={archived}
          />
        ) : (
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32 }}
            onClick={() => !archived && setEditTitle(true)}
          >
            {goal.title}
          </Typography>
        )}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Дублировать цель" arrow>
            <IconButton color="primary" onClick={handleDuplicateGoal} disabled={archived}><ContentCopyIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Удалить цель и все ключевые результаты" arrow>
            <IconButton color="error" onClick={() => setConfirmOpen(true)} disabled={archived}><DeleteIcon /></IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Удалить цель и все ключевые результаты?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Отмена</Button>
          <Button color="error" onClick={handleDeleteGoal}>Удалить</Button>
        </DialogActions>
      </Dialog>
      {/* Удалить TextField с label="Ключевые инициативы" и все связанные с ним обработчики и состояния (initiatives, setInitiatives, saveInitiatives, handleInitiativesChange, handleInitiativesBlur). */}
      {/* Оставить только отображение и редактирование заголовка цели (title). */}
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        <Box sx={{ flex: 2 }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff' }}>
            {/* В thead таблицы KR оставить только одну строку: */}
            <thead>
              <tr>
                <th style={{ textAlign: 'center', minWidth: 48 }}>Прогресс</th>
                <th style={{ textAlign: 'left', padding: 8, fontWeight: 600, fontSize: 16 }} colSpan={8}></th>
              </tr>
            </thead>
            <tbody>
              {goal.keyResults.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 16, color: '#aaa' }}>Нет ключевых результатов. Добавьте первый KR.</td></tr>
              ) : (
                goal.keyResults.slice().sort((a, b) => a.order - b.order).map((kr) => (
                  <KeyResultRow
                    key={kr.id}
                    kr={kr}
                    editKR={editKR as any}
                    editValue={editValue}
                    archived={archived}
                    onEditCell={handleEditCell as any}
                    onSaveCell={handleSaveCell as any}
                    onDuplicateKR={handleDuplicateKR}
                    onDeleteKR={handleDeleteKR}
                    setEditValue={setEditValue}
                  />
                ))
              )}
            </tbody>
          </table>
        </Box>
        <Box sx={{ minWidth: 420, maxWidth: 520 }}>
          <WeeklyMonitoringTable krList={goal.keyResults.slice().sort((a, b) => a.order - b.order)} />
        </Box>
      </Stack>
      <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => onAddKR(goal.id)} disabled={archived}>
        + Добавить ключевой результат
      </Button>
    </Box>
  );
};

export default GoalItem; 