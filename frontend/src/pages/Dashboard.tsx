import React, { useState, useEffect } from 'react';
import { Box, Snackbar, Dialog, DialogTitle, DialogActions, DialogContent, TextField, Button } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import GoalItem from '../components/GoalItem';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import OkrHeader from '../components/OkrHeader';
import OkrEmptyState from '../components/OkrEmptyState';
import { Avatar } from '@mui/material';
import { useUserStore } from '../store/userStore';

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
interface OKR {
  id: string;
  period: string;
  archived: boolean;
  goals: Goal[];
}


export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: okrsFromServer = [] } = useQuery({
    queryKey: ['okrs'],
    queryFn: async () => {
      const res = await axios.get('/okr');
      return res.data;
    },
  });
  const [okrs, setOkrs] = useState<OKR[]>([]);
  useEffect(() => {
    setOkrs(okrsFromServer);
  }, [okrsFromServer]);

  console.log('okrs:', okrs);

  // Мутации для обновления данных

  const [undo, setUndo] = React.useState<{ type: 'goal' | 'kr'; data: any; parentId: string } | null>(null);
  const [undoOpen, setUndoOpen] = React.useState(false);
  const undoTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [archiveDialog, setArchiveDialog] = React.useState<{ open: boolean; okrId: string | null }>({ open: false, okrId: null });
  const [addOKRDialog, setAddOKRDialog] = useState(false);
  const [newPeriod, setNewPeriod] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; okrId: string | null }>({ open: false, okrId: null });
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  const user = useUserStore((s) => s.user);

  // Получить уникальные периоды из okrs
  const periods = Array.from(new Set(okrsFromServer.map((okr: OKR) => okr.period)));
  const selectedOKR = okrs.find(okr => okr.period === selectedPeriod);

  useEffect(() => {
    if (!selectedPeriod && periods.length > 0) {
      setSelectedPeriod(periods[0]);
    }
  }, [periods, selectedPeriod]);

  const createOKRMutation = useMutation({
    mutationFn: (period: string) => axios.post('/okr', { period }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
      setAddOKRDialog(false);
      setNewPeriod('');
    },
  });

  const handleAddGoal = async (okrId: string) => {
    const res = await axios.post(`/okr/${okrId}/goal`, { title: 'Новая цель', keyInitiatives: '' });
    // Сразу создаём первый KR
    await axios.post(`/okr/goal/${res.data.id}/keyresult`, { title: 'Ключевой результат', metric: '%', base: 0, plan: 100, formula: 'Макс' });
    // Обновляем OKR
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };

  const handleAddKR = async (goalId: string) => {
    await axios.post(`/okr/goal/${goalId}/keyresult`, { title: 'Ключевой результат', metric: '%', base: 0, plan: 100, formula: 'Макс' });
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };

  const handleGoalChange = (okrId: string, updatedGoal: Goal) => {
    setOkrs(prevOkrs =>
      prevOkrs.map(okr =>
        okr.id === okrId
          ? { ...okr, goals: okr.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g) }
          : okr
      )
    );
  };

  const handleDeleteGoal = async (goalId: string) => {
    const okr = (okrs as OKR[]).find((okr) => (okr.goals as Goal[]).some((g) => g.id === goalId));
    const goal = okr?.goals.find((g) => g.id === goalId);
    if (!okr || !goal) return;
    setUndo({ type: 'goal', data: goal, parentId: okr.id });
    setUndoOpen(true);
    await axios.delete(`/okr/${okr.id}/goal/${goalId}`);
    // queryClient.invalidateQueries({ queryKey: ['okrs'] });
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    undoTimeout.current = setTimeout(() => setUndo(null), 5000);
  };
  const handleDeleteKR = async (krId: string) => {
    const goal = (okrs as OKR[]).flatMap((okr) => okr.goals as Goal[]).find((g) => (g.keyResults as KeyResult[]).some((k) => k.id === krId));
    const kr = goal?.keyResults.find((k) => k.id === krId);
    if (!goal || !kr) return;
    setUndo({ type: 'kr', data: kr, parentId: goal.id });
    setUndoOpen(true);
    await axios.delete(`/okr/goal/${goal.id}/keyresult/${krId}`);
    // queryClient.invalidateQueries({ queryKey: ['okrs'] });
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    undoTimeout.current = setTimeout(() => setUndo(null), 5000);
  };
  const handleUndo = async () => {
    if (!undo) return;
    if (undo.type === 'goal') {
      // Восстановить цель и все её KR
      const res = await axios.post(`/okr/${undo.parentId}/goal`, { title: undo.data.title, keyInitiatives: undo.data.keyInitiatives });
      // Восстановить порядок целей (order)
      await axios.put(`/okr/${undo.parentId}/goal/${res.data.id}`, { order: undo.data.order, title: undo.data.title, keyInitiatives: undo.data.keyInitiatives });
      for (let idx = 0; idx < undo.data.keyResults.length; idx++) {
        const kr = undo.data.keyResults[idx];
        await axios.post(`/okr/goal/${res.data.id}/keyresult`, { title: kr.title, metric: kr.metric, base: kr.base, plan: kr.plan, formula: kr.formula, order: kr.order ?? idx });
      }
    } else if (undo.type === 'kr') {
      await axios.post(`/okr/goal/${undo.parentId}/keyresult`, { title: undo.data.title, metric: undo.data.metric, base: undo.data.base, plan: undo.data.plan, formula: undo.data.formula, order: undo.data.order });
    }
    setUndo(null);
    setUndoOpen(false);
    // queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };

  const confirmArchiveOKR = async () => {
    if (!archiveDialog.okrId) return;
    await axios.post(`/okr/${archiveDialog.okrId}/archive`);
    setArchiveDialog({ open: false, okrId: null });
    // queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };


  const handleDuplicateGoal = async (goalId: string) => {
    await axios.post(`/okr/goal/${goalId}/duplicate`);
    // queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };
  const handleDuplicateKR = async (krId: string) => {
    const goal = (okrs as OKR[]).flatMap((okr) => okr.goals as Goal[]).find((g) => (g.keyResults as KeyResult[]).some((k) => k.id === krId));
    if (!goal) return;
    await axios.post(`/okr/goal/${goal.id}/keyresult/${krId}/duplicate`);
    // queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };


  const handleDeleteOKR = async () => {
    if (!deleteDialog.okrId) return;
    await axios.delete(`/okr/${deleteDialog.okrId}`);
    setDeleteDialog({ open: false, okrId: null });
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };

  // --- UI ---
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    if (result.type === 'goal') {
      const okr = okrs.find((o: OKR) => o.goals.some((g: Goal) => g.id === result.draggableId));
      if (!okr) return;
      const goals = okr.goals.slice().sort((a: Goal, b: Goal) => (a.order ?? 0) - (b.order ?? 0));
      const [removed] = goals.splice(result.source.index, 1);
      goals.splice(result.destination.index, 0, removed);
      const newGoalIds = goals.map((g: Goal) => g.id);
      await axios.post(`/okr/${okr.id}/reorder-goals`, { goalIds: newGoalIds });
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    }
    if (result.type === 'kr') {
      const goal = okrs.flatMap((okr: OKR) => okr.goals).find((g: Goal) => g.keyResults.some((kr: KeyResult) => kr.id === result.draggableId));
      if (!goal) return;
      const krs = goal.keyResults.slice().sort((a: KeyResult, b: KeyResult) => a.order - b.order);
      const [removed] = krs.splice(result.source.index, 1);
      krs.splice(result.destination.index, 0, removed);
      const newKrIds = krs.map((kr: KeyResult) => kr.id);
      await axios.post(`/okr/goal/${goal.id}/reorder-keyresults`, { krIds: newKrIds });
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    }
  };

  return (
    <Box sx={{ background: '#f7f8fa', minHeight: '100vh', pt: 3, pr: 3, pl: 3, ml: { sm: '0' } }}>
      {/* Аватар пользователя в правом верхнем углу */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: user?.avatar?.color || '#2563eb', width: 40, height: 40, fontWeight: 700 }}>
          {user?.avatar?.initials || (user?.firstName?.[0] + user?.lastName?.[0] || '').toUpperCase()}
        </Avatar>
      </Box>
      {/* Основной контент Dashboard */}
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#f7f8fa', marginBottom: 12 }}>
        <thead>
          <tr style={{ fontWeight: 500, fontSize: 15, color: '#64748b' }}>
            <th style={{ textAlign: 'left', padding: 8, minWidth: 180 }}>Ключевой результат</th>
            <th style={{ textAlign: 'center', minWidth: 70 }}>Метрика</th>
            <th style={{ textAlign: 'center', minWidth: 40 }}>База</th>
            <th style={{ textAlign: 'center', minWidth: 40 }}>План</th>
            <th style={{ textAlign: 'center', minWidth: 40 }}>Факт</th>
            <th style={{ textAlign: 'center', minWidth: 90 }}>Формула</th>
            <th style={{ minWidth: 36 }}></th>
            <th style={{ minWidth: 36 }}></th>
          </tr>
        </thead>
      </table>
      {selectedOKR ? (
        <DragDropContext onDragEnd={onDragEnd}>
          {selectedOKR && (
            <Droppable droppableId={`okr-${selectedOKR.id}`} type="goal">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {selectedOKR.goals
                    .slice()
                    .sort((a: Goal, b: Goal) => (a.order ?? 0) - (b.order ?? 0))
                    .map((goal, idx) => (
                      <Draggable key={goal.id} draggableId={goal.id} index={idx} isDragDisabled={selectedOKR.archived}>
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <GoalItem
                              goal={{ ...goal, order: goal.order ?? 0 }}
                              okrId={selectedOKR.id}
                              onGoalChange={updatedGoal => handleGoalChange(selectedOKR.id, { ...goal, ...updatedGoal, order: updatedGoal.order ?? goal.order ?? 0 })}
                              onAddKR={handleAddKR}
                              onDeleteGoal={handleDeleteGoal}
                              onDeleteKR={handleDeleteKR}
                              onDuplicateGoal={handleDuplicateGoal}
                              onDuplicateKR={handleDuplicateKR}
                              archived={selectedOKR.archived}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </DragDropContext>
      ) : (
        <OkrEmptyState onCreateOkr={() => createOKRMutation.mutate(selectedPeriod)} />
      )}
      {/* Кнопка добавить цель */}
      {selectedOKR && !selectedOKR.archived && (
        <Button variant="outlined" startIcon={<AddIcon />} sx={{ mt: 2, borderRadius: 2, fontWeight: 600, fontSize: 16, color: '#1976d2', borderColor: '#1976d2', background: '#fff', '&:hover': { background: '#e3f2fd', borderColor: '#1976d2' } }} onClick={() => handleAddGoal(selectedOKR.id)}>
          Добавить цель
        </Button>
      )}
      {/* Диалоги и Snackbar */}
      <Snackbar open={undoOpen && !!undo} autoHideDuration={5000} onClose={() => setUndoOpen(false)} message={undo?.type === 'goal' ? 'Цель удалена' : 'Ключевой результат удалён'} action={
        <Button color="secondary" size="small" onClick={handleUndo}>
          Отменить
        </Button>
      } />
      <Dialog open={archiveDialog.open} onClose={() => setArchiveDialog({ open: false, okrId: null })}>
        <DialogTitle>Архивировать OKR?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setArchiveDialog({ open: false, okrId: null })}>Отмена</Button>
          <Button color="primary" onClick={confirmArchiveOKR}>Архивировать</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={addOKRDialog} onClose={() => setAddOKRDialog(false)}>
        <DialogTitle>Создать OKR</DialogTitle>
        <DialogContent>
          <TextField
            label="Период (например, 2025-Q1)"
            value={newPeriod}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPeriod(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOKRDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={() => createOKRMutation.mutate(newPeriod)} disabled={!newPeriod}>Создать</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, okrId: null })}>
        <DialogTitle>Удалить OKR?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, okrId: null })}>Отмена</Button>
          <Button color="error" onClick={handleDeleteOKR}>Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 