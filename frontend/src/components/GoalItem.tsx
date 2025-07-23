import React from 'react';
import { Box, Stack, Typography, TextField, Button, IconButton, Tooltip, Dialog, DialogTitle, DialogActions, Paper } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import WeeklyMonitoringTable from './WeeklyMonitoringTable';
import KeyResultRow from './KeyResultRow';
import axios from 'axios';
import KeyResultTableHeader from './KeyResultTableHeader';
import { useQueryClient } from '@tanstack/react-query';

interface KeyResult {
  id: string;
  title: string;
  metric: string;
  base: number;
  plan: number;
  formula: string;
  fact: number;
  order: number | undefined;
  weeklyMonitoring?: { weekNumber: number; value: number }[];
}
interface Goal {
  id: string;
  title: string;
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
  mode?: 'weeks'; // только недельные значения
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, okrId, onGoalChange, onAddKR, archived, mode = 'weeks' }) => {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [editKR, setEditKR] = React.useState<{ krId: string; field: keyof KeyResult } | null>(null);
  const [editValue, setEditValue] = React.useState<any>(null);
  // Добавить состояние editTitle и editTitleValue
  const [editTitle, setEditTitle] = React.useState(false);
  const [editTitleValue, setEditTitleValue] = React.useState(goal.title);

  // Локальное состояние для актуальных недельных значений по каждому KR
  const [weeklyValues, setWeeklyValues] = React.useState<{ [krId: string]: { weekNumber: number, value: number }[] }>({});
  // Локальное состояние для отслеживания загружаемого KR
  const [loadingKRId, setLoadingKRId] = React.useState<string | null>(null);
  const [, setSaving] = React.useState(false);

  // useEffect: обновлять локальное состояние инициативы только если оно реально изменилось на сервере
  React.useEffect(() => {
    // No need to update initiatives here as the field is removed
  }, []);

  // Сохранять инициативу только на blur (или debounce), а не на каждый onChange


  // Для KR: редактирование только локально, invalidateQueries только после onBlur (handleSaveCell)
  const handleEditCell = (krId: string, field: keyof KeyResult, value: any) => {
    // Если редактируется формула, сразу пересчитываем fact и обновляем KR в UI
    if (field === 'formula') {
      const weekly = weeklyValues[krId] !== undefined
        ? weeklyValues[krId]
        : (goal.keyResults.find(k => k.id === krId) as any)?.weeklyMonitoring?.map((w: any) => ({ weekNumber: w.weekNumber, value: w.value })) || [];
      const newFact = calcFact({ ...goal.keyResults.find(k => k.id === krId), formula: value }, weekly);
      // Обновляем KR в goal.keyResults локально
      const newKeyResults = goal.keyResults.map(k => k.id === krId ? { ...k, formula: value, fact: newFact } : k);
      onGoalChange({ ...goal, keyResults: newKeyResults });
    }
    setEditKR({ krId, field });
    setEditValue(value);
  };
  // Функция для расчёта fact по формуле (аналог calcFact на бэке), всегда сортирует weeklyMonitoring по weekNumber
  function calcFact(kr: any, weekly: { weekNumber: number, value: number }[]) {
    if (!weekly.length) return 0;
    // Сортируем по weekNumber по возрастанию
    const sorted = weekly.slice().sort((a, b) => a.weekNumber - b.weekNumber);
    const values = sorted.map(e => e.value);
    const base = kr.base || 0;
    switch ((kr.formula || '').toLowerCase()) {
      case 'макс':
        return Math.max(...values);
      case 'среднее':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'текущее':
        return sorted[sorted.length - 1].value; // последнее по неделе
      case 'мин':
        return Math.min(...values);
      case 'сумма':
        return values.reduce((a, b) => a + b, 0);
      case 'макс без базы':
        return Math.max(...values) - base;
      case 'среднее без базы':
        return values.reduce((a, b) => a + b, 0) / values.length - base;
      case 'текущее без базы':
        return sorted[sorted.length - 1].value - base;
      case 'минимум без базы':
        return Math.min(...values) - base;
      case 'сумма без базы':
        return values.reduce((a, b) => a + b, 0) - base;
      default:
        return Math.max(...values);
    }
  }
  // Обновлённый onSaveCell: выставляет loadingKRId на время запроса
  const handleSaveCell = async (kr: KeyResult, field: keyof KeyResult) => {
    setEditKR(null);
    setLoadingKRId(kr.id);
    let updatedKR = { ...kr, [field]: editValue };
    const weekly = weeklyValues[kr.id] !== undefined
      ? weeklyValues[kr.id]
      : (kr as any).weeklyMonitoring ? (kr as any).weeklyMonitoring.map((w: any) => ({ weekNumber: w.weekNumber, value: w.value })) : [];
    if (field === 'formula' || field === 'base') {
      updatedKR.fact = calcFact(updatedKR, weekly);
    }
    if (!updatedKR.title || typeof updatedKR.metric !== 'string' || !updatedKR.metric || updatedKR.base === undefined || updatedKR.plan === undefined || !updatedKR.formula) {
      alert('Все поля (название, метрика, база, план, формула) должны быть заполнены!');
      setLoadingKRId(null);
      return;
    }
    // Сохраняем KR
    await axios.put(`/okr/goal/${goal.id}/keyresult/${kr.id}`, {
      title: updatedKR.title,
      metric: updatedKR.metric,
      base: updatedKR.base,
      plan: updatedKR.plan,
      formula: updatedKR.formula,
      fact: updatedKR.fact,
    });
    // После сохранения — повторно загружаем monitoring и обновляем KR
    const res = await axios.get(`/okr/keyresult/${kr.id}/monitoring`);
    const newWeekly = res.data.map((e: any) => ({ weekNumber: e.weekNumber, value: e.value }));
    const newFact = calcFact(updatedKR, newWeekly);
    const newKeyResults = goal.keyResults.map(k => k.id === kr.id ? { ...k, ...updatedKR, fact: newFact } : k);
    onGoalChange({ ...goal, keyResults: newKeyResults });
    setLoadingKRId(null);
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
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

  // Обновление fact у KR при изменении недельных отметок
  const handleFactChange = (krId: string, newFact: number) => {
    const newKeyResults = goal.keyResults.map(k => k.id === krId ? { ...k, fact: newFact } : k);
    onGoalChange({ ...goal, keyResults: newKeyResults });
  };

  // Обновление недельных значений для KR
  const handleWeeklyChange = (krId: string, weeks: { weekNumber: number, value: number | null }[]) => {
    // Фильтруем только числа
    const arr = weeks.filter(w => typeof w.value === 'number' && w.value !== null) as { weekNumber: number, value: number }[];
    setWeeklyValues(prev => ({ ...prev, [krId]: arr }));
  };

  // 1. Перед заголовком цели (или в Stack), добавить визуальный блок среднего прогресса:
  //   const avgProgress = goal.keyResults.length > 0 ? Math.round(goal.keyResults.reduce((sum, kr) => sum + (kr.plan > 0 ? (kr.fact / kr.plan) * 100 : 0), 0) / goal.keyResults.length) : 0;
  //   <Box ...>{avgProgress}%</Box>
  const avgProgress = goal.keyResults.length > 0 ? Math.round(goal.keyResults.reduce((sum, kr) => sum + (kr.plan > 0 ? (kr.fact / kr.plan) * 100 : 0), 0) / goal.keyResults.length) : 0;

  return (
    <Paper key={goal.id} elevation={3} sx={{ mb: 4, borderRadius: 4, p: { xs: 2, md: 3 }, background: '#fff', boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)' }}>
      {/* --- Визуальный блок среднего прогресса слева от заголовка цели --- */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '50%',
            background: avgProgress >= 80 ? '#e6f4ea' : avgProgress >= 40 ? '#fff7e6' : '#fdeaea',
            color: avgProgress >= 80 ? '#43a047' : avgProgress >= 40 ? '#ffb300' : '#ef5350',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>{avgProgress}%</Box>
          {editTitle ? (
            <TextField
              value={editTitleValue}
              onChange={e => setEditTitleValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setEditTitle(false); setEditTitleValue(goal.title); } }}
              size="small"
              autoFocus
              sx={{ fontWeight: 700, fontSize: 22, minWidth: 180, background: '#f7f9fb', borderRadius: 2 }}
              disabled={archived}
            />
          ) : (
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ cursor: archived ? 'default' : 'pointer', minHeight: 32, fontSize: 22 }}
              onClick={() => !archived && setEditTitle(true)}
            >
              {goal.title}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Дублировать цель" arrow>
            <IconButton color="primary" onClick={handleDuplicateGoal} disabled={archived}><ContentCopyIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Удалить цель и все ключевые результаты" arrow>
            <IconButton color="error" onClick={() => setConfirmOpen(true)} disabled={archived}><DeleteIcon /></IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Удалить цель и все ключевые результаты?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Отмена</Button>
          <Button color="error" onClick={handleDeleteGoal}>Удалить</Button>
        </DialogActions>
      </Dialog>
      {/* Удалить TextField с label="Ключевые инициативы" и все связанные с ним обработчики и состояния (initiatives, setInitiatives, saveInitiatives, handleInitiativesChange, handleInitiativesBlur). */}
      {/* Оставить только отображение и редактирование заголовка цели (title). */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '60% 40%' }, gap: 0, alignItems: 'start' }}>
        <Box sx={{ width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff' }}>
            <KeyResultTableHeader />
            <tbody>
              {goal.keyResults.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: 16, color: '#aaa' }}>Нет ключевых результатов. Добавьте первый KR.</td></tr>
              ) : (
                goal.keyResults.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((kr, krIdx) => (
                  <KeyResultRow
                    key={kr.id}
                    kr={kr}
                    index={krIdx}
                    editKR={editKR as any}
                    editValue={editValue}
                    archived={archived}
                    onEditCell={handleEditCell as any}
                    onSaveCell={handleSaveCell as any}
                    onDuplicateKR={handleDuplicateKR}
                    onDeleteKR={handleDeleteKR}
                    setEditValue={setEditValue}
                    loading={loadingKRId === kr.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </Box>
        <Box sx={{ width: '100%' }}>
          <WeeklyMonitoringTable krList={goal.keyResults.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))} onFactChange={handleFactChange} onWeeklyChange={handleWeeklyChange} />
        </Box>
      </Box>
      <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => onAddKR(goal.id)} disabled={archived}>
        + Добавить ключевой результат
      </Button>
    </Paper>
  );
};

export default GoalItem; 